"""
Vehicle Enquiry Service (VES) API Client
A production-ready FastAPI wrapper for the DVLA Vehicle Enquiry Service API
"""
import os
import re
import time
import logging
from datetime import datetime, timedelta
import asyncio
from typing import Optional, Dict, Any, List, Union

import httpx
from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware # Import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel, Field, field_validator
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log")
    ]
)
logger = logging.getLogger("ves_api")

# Constants and configuration
class Config:
    # API settings
    DVLA_API_URL = os.getenv("DVLA_API_URL", "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles")
    DVLA_TEST_API_URL = os.getenv("DVLA_TEST_API_URL", "https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles")
    DVLA_API_KEY = os.getenv("DVLA_API_KEY")
    USE_TEST_ENV = os.getenv("USE_TEST_ENV", "false").lower() == "true"

    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8004"))

    # Security settings
    # Get origins from env or use defaults with localhost
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://check-mot.co.uk,https://www.check-mot.co.uk").split(",")

    # Caching settings
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour by default
    CACHE_MAXSIZE = int(os.getenv("CACHE_MAXSIZE", "1000"))

    # Rate limiting settings
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "1"))  # 5 requests per second by default

    # Timeout settings
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "10"))  # 10 seconds timeout

    # Retry settings
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_BACKOFF_FACTOR = float(os.getenv("RETRY_BACKOFF_FACTOR", "0.5"))

    @classmethod
    def get_api_url(cls):
        """Return the appropriate API URL based on configuration"""
        return cls.DVLA_TEST_API_URL if cls.USE_TEST_ENV else cls.DVLA_API_URL

# Validate required environment variables
required_env_vars = ["DVLA_API_KEY"]
missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Models
class ErrorDetail(BaseModel):
    status: Optional[str] = None
    code: Optional[str] = None
    title: Optional[str] = None
    detail: Optional[str] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    errors: List[ErrorDetail] = []
    message: Optional[str] = None
    requestId: Optional[str] = None

class VehicleRequest(BaseModel):
    registrationNumber: str

    @field_validator('registrationNumber')
    @classmethod
    def validate_registration_number(cls, v):
        """Validate the registration number format"""
        # Remove spaces and convert to uppercase
        v = re.sub(r'\s+', '', v).upper()

        # Check if the registration number contains only alphanumeric characters
        if not re.match(r'^[A-Z0-9]+$', v):
            raise ValueError("Registration number must contain only alphanumeric characters")

        # Check if the registration number is of a reasonable length (UK plates are typically 1-7 characters)
        if not (1 <= len(v) <= 7):
            raise ValueError("Registration number must be between 1 and 7 characters long")

        return v

class VehicleResponse(BaseModel):
    registrationNumber: str
    taxStatus: Optional[str] = None
    taxDueDate: Optional[str] = None
    artEndDate: Optional[str] = None
    motStatus: Optional[str] = None
    motExpiryDate: Optional[str] = None
    make: Optional[str] = None
    monthOfFirstDvlaRegistration: Optional[str] = None
    monthOfFirstRegistration: Optional[str] = None
    yearOfManufacture: Optional[int] = None
    engineCapacity: Optional[int] = None
    co2Emissions: Optional[int] = None
    fuelType: Optional[str] = None
    markedForExport: Optional[bool] = None
    colour: Optional[str] = None
    typeApproval: Optional[str] = None
    wheelplan: Optional[str] = None
    revenueWeight: Optional[int] = None
    realDrivingEmissions: Optional[str] = None
    dateOfLastV5CIssued: Optional[str] = None
    euroStatus: Optional[str] = None
    automatedVehicle: Optional[bool] = None

class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: str
    version: str

# Cache initialization
vehicle_cache = {}

# FastAPI application - DEFINE APP BEFORE MIDDLEWARES
app = FastAPI(
    title="Vehicle Information Service",
    description="A production-ready API for the DVLA Vehicle Enquiry Service",
    version="1.0.0",
    docs_url=None,  # Disable automatic docs to customize
    redoc_url=None  # Disable automatic redoc
)

# Custom middleware for rate limiting
class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.request_timestamps = {}  # client_ip -> list of timestamps

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = request.client.host

        # Only rate limit the vehicle endpoint
        if request.url.path == "/api/vehicle" and request.method == "POST":
            now = time.time()

            # Initialize if client_ip not in dictionary
            if client_ip not in self.request_timestamps:
                self.request_timestamps[client_ip] = []

            # Clean old timestamps
            self.request_timestamps[client_ip] = [
                ts for ts in self.request_timestamps[client_ip]
                if now - ts < Config.RATE_LIMIT_PERIOD
            ]

            # Check if rate limit exceeded
            if len(self.request_timestamps[client_ip]) >= Config.RATE_LIMIT_REQUESTS:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please try again later."}
                )

            # Add current timestamp
            self.request_timestamps[client_ip].append(now)

        return await call_next(request)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    # Include more details in the log message
    log_message = (
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host}:{request.client.port} - "
        f"Status: {response.status_code} - "
        f"Process Time: {process_time:.4f}s"
    )

    if response.status_code >= 400: # Log errors and warnings at higher levels
        logger.warning(log_message) # Or logger.error depending on severity
    else:
        logger.info(log_message)

    return response

# Add CORS middleware FIRST (before other middleware)
# This is critical for handling OPTIONS preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Cache", "Cache-Control", "Content-Type"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Add Gzip middleware - add this right after CORS middleware
app.add_middleware(GZipMiddleware, minimum_size=500) # Only compress responses larger than 500 bytes

# Add rate limiter middleware AFTER CORS and Gzip
app.add_middleware(RateLimiterMiddleware)

# Custom exception handler for application errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTPException: {exc.detail}", exc_info=True)
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail}
    )

# Custom exception handler for unexpected errors
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An unexpected error occurred. Please try again later."}
    )

# Dependency to check API key
def verify_api_key():
    if not Config.DVLA_API_KEY:
        logger.error("DVLA API key is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured. Please contact the administrator."
        )
    return Config.DVLA_API_KEY

# Cache helper functions
def is_cache_valid(cache_key):
    """Check if a cache entry is still valid."""
    if cache_key in vehicle_cache:
        cache_time = vehicle_cache[cache_key]["timestamp"]
        return (time.time() - cache_time) < Config.CACHE_TTL
    return False

async def get_cached_vehicle_data(cache_key):
    """Get vehicle data from cache if available and valid."""
    if is_cache_valid(cache_key):
        logger.debug(f"Cache hit for {cache_key}")
        return vehicle_cache[cache_key]["data"]
    logger.debug(f"Cache miss for {cache_key}")
    return None

def update_vehicle_cache(cache_key, data):
    """Update the vehicle cache with new data."""
    vehicle_cache[cache_key] = {
        "data": data,
        "timestamp": time.time()
    }
    logger.debug(f"Updated cache for {cache_key}")

# Custom Swagger UI with authentication
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title=app.title,
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css",
    )

# Root endpoint for basic API info
@app.get("/")
async def root():
    """Root endpoint - basic API info"""
    return {
        "name": "Vehicle Enquiry Service API",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/api/vehicle",
            "/api/cache/clear"
        ]
    }

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "ok",
        "environment": "test" if Config.USE_TEST_ENV else "production",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Handle OPTIONS request explicitly for /api/vehicle
@app.options("/api/vehicle")
async def vehicle_options():
    """Handle OPTIONS preflight requests for the vehicle endpoint"""
    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept",
            "Access-Control-Max-Age": "86400"  # Cache preflight request for 24 hours
        }
    )

# Main vehicle information endpoint
@app.post("/api/vehicle", response_model=VehicleResponse,
          responses={
              400: {"model": ErrorResponse},
              404: {"model": ErrorResponse},
              429: {"model": ErrorResponse},
              500: {"model": ErrorResponse},
              503: {"model": ErrorResponse}
          })
async def get_vehicle_info(
    request: VehicleRequest,
    response: Response,
    api_key: str = Depends(verify_api_key)
):
    vrn = request.registrationNumber
    cache_key = f"reg_{vrn}"

    logger.debug(f"Received request for VRN: {vrn}") # Debug level for request start

    # Check cache first
    cached_data = await get_cached_vehicle_data(cache_key)
    is_cached = cached_data is not None

    if is_cached:
        # Set cache headers
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        logger.info(f"Cache HIT for VRN: {vrn}") # Info level for cache hit

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

        return cached_data

    logger.info(f"Cache MISS for VRN: {vrn}. Fetching from DVLA API.") # Info level for cache miss

    # Prepare headers
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    # Prepare request body
    payload = {"registrationNumber": vrn}

    # Get the appropriate API URL
    api_url = Config.get_api_url()

    # Define retry strategy
    retry_count = 0
    max_retries = Config.MAX_RETRIES

    while retry_count <= max_retries:
        try:
            async with httpx.AsyncClient(timeout=Config.REQUEST_TIMEOUT) as client:
                logger.debug(f"Attempting DVLA API request for VRN: {vrn}, retry count: {retry_count}") # Debug level for API request attempt
                resp = await client.post(
                    api_url,
                    json=payload,
                    headers=headers
                )

            # Handle successful response
            if resp.status_code == 200:
                vehicle_data = resp.json()
                # Cache the response
                update_vehicle_cache(cache_key, vehicle_data)

                # Set cache headers
                response.headers["X-Cache"] = "MISS"
                response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"

                # Add security headers
                response.headers["X-Content-Type-Options"] = "nosniff"
                response.headers["X-Frame-Options"] = "DENY"
                response.headers["Content-Security-Policy"] = "default-src 'self'"

                logger.info(f"Successfully fetched vehicle data from DVLA API for VRN: {vrn}") # Info level for successful API call
                return vehicle_data

            # Handle error responses
            error_data = {}
            try:
                error_data = resp.json()
            except Exception:
                error_data = {"errors": [{"detail": "Unparseable error response from DVLA API"}]}

            # Extract error details
            error_detail = "Unknown error"
            if "errors" in error_data and error_data["errors"]:
                error_detail = error_data["errors"][0].get("detail", "Unknown error")

            # Handle different status codes
            if resp.status_code == 400:
                logger.warning(f"Bad request for VRN {vrn}: {error_detail}") # Warning for 400 error
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bad request: {error_detail}"
                )
            elif resp.status_code == 404:
                logger.info(f"Vehicle not found for VRN {vrn}") # Info for 404 - vehicle not found (normal case, not error)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vehicle not found"
                )
            elif resp.status_code == 429:
                # Rate limiting - retry with backoff
                retry_count += 1
                if retry_count <= max_retries:
                    wait_time = Config.RETRY_BACKOFF_FACTOR * (2 ** (retry_count - 1))
                    logger.warning(f"DVLA API Rate limited (429) for VRN: {vrn}, retry: {retry_count}") # Warning for 429
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.error(f"Rate limit exceeded and max retries reached for VRN: {vrn}") # Error for 429 and max retries
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="DVLA API rate limit exceeded. Please try again later."
                    )
            elif resp.status_code in (500, 502, 503, 504):
                # Server error - retry with backoff
                retry_count += 1
                if retry_count <= max_retries:
                    wait_time = Config.RETRY_BACKOFF_FACTOR * (2 ** (retry_count - 1))
                    logger.warning(f"DVLA API Server error ({resp.status_code}) for VRN: {vrn}, retry: {retry_count}") # Warning for 5xx errors
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.error(f"DVLA API server error and max retries reached for VRN: {vrn}: {error_detail}") # Error for 5xx and max retries
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="DVLA API service unavailable. Please try again later."
                    )
            else:
                # Other errors
                logger.error(f"Unexpected error from DVLA API: {resp.status_code} - {error_detail} for VRN: {vrn}") # Error for unexpected status codes
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error from DVLA API: {error_detail}"
                )

        except httpx.RequestError as e:
            # Network errors
            retry_count += 1
            if retry_count <= max_retries:
                wait_time = Config.RETRY_BACKOFF_FACTOR * (2 ** (retry_count - 1))
                logger.warning(f"Network error during DVLA API request for VRN: {vrn}, retry: {retry_count}: {e}") # Warning for network errors
                await asyncio.sleep(wait_time)
                continue
            else:
                logger.error(f"Network error after max retries for VRN: {vrn}: {str(e)}") # Error for network errors after max retries
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Service unavailable: {str(e)}"
                )
        except asyncio.TimeoutError:
            # Timeout errors
            retry_count += 1
            if retry_count <= max_retries:
                wait_time = Config.RETRY_BACKOFF_FACTOR * (2 ** (retry_count - 1))
                logger.warning(f"Timeout error during DVLA API request for VRN: {vrn}, retry: {retry_count}") # Warning for timeout errors
                await asyncio.sleep(wait_time)
                continue
            else:
                logger.error(f"Request timed out after max retries for VRN: {vrn}") # Error for timeout errors after max retries
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Request to DVLA API timed out. Please try again later."
                )

    # This should not be reached but added as a fallback
    logger.error(f"Maximum retries exceeded for VRN: {vrn}. Request failed completely.") # Error if max retries exceeded in general
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Maximum retries exceeded"
    )

# Endpoint to manually clear the cache
@app.post("/api/cache/clear")
async def clear_cache():
    """Clear the vehicle data cache"""
    global vehicle_cache
    vehicle_cache = {}
    logger.info("Cache cleared manually")
    return {"status": "success", "message": "Cache cleared successfully"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    import asyncio

    # Fix asyncio event loop policy for Windows if needed
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    # Log environment information
    logger.info(f"Starting server in {'TEST' if Config.USE_TEST_ENV else 'PRODUCTION'} mode")
    logger.info(f"Using API URL: {Config.get_api_url()}")
    logger.info(f"Allowing CORS from origins: {Config.ALLOWED_ORIGINS}")

    # Start the server
    uvicorn.run(
        app,
        host=Config.HOST,
        port=Config.PORT,
        log_level="info"
    )