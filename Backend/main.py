import os
import requests
import json
import time
from functools import lru_cache
from typing import Dict, Any, Optional, Union, List
from fastapi import FastAPI, HTTPException, Depends, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="MOT History API Service",
    description="Backend service providing MOT history data for vehicles",
    version="1.0.0",
)

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You should restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for tokens and vehicle data
TOKEN_CACHE = {
    "access_token": None,
    "expires_at": 0,
}

# Vehicle data cache with TTL (5 minutes)
VEHICLE_CACHE = {}
CACHE_TTL = 300  # seconds (5 minutes)

# Pydantic models for API responses
class Defect(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    dangerous: Optional[bool] = None

class MotTest(BaseModel):
    completedDate: Optional[str] = None
    testResult: Optional[str] = None
    expiryDate: Optional[str] = None
    odometerValue: Optional[str] = None
    odometerUnit: Optional[str] = None
    odometerResultType: Optional[str] = None
    motTestNumber: Optional[str] = None
    dataSource: Optional[str] = None
    location: Optional[str] = None
    defects: Optional[List[Defect]] = None

class VehicleBase(BaseModel):
    registration: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    fuelType: Optional[str] = None
    primaryColour: Optional[str] = None
    registrationDate: Optional[str] = None
    manufactureDate: Optional[str] = None
    hasOutstandingRecall: Optional[str] = None

class VehicleWithMot(VehicleBase):
    firstUsedDate: Optional[str] = None
    engineSize: Optional[str] = None
    motTests: List[MotTest] = []

class NewRegVehicle(VehicleBase):
    manufactureYear: Optional[str] = None
    motTestDueDate: Optional[str] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    errorCode: Optional[str] = None
    errorMessage: str
    requestId: Optional[str] = None

# Auth dependency with caching
async def get_access_token() -> str:
    """
    Get OAuth access token for the MOT API with caching.
    Returns the token as a string.
    """
    global TOKEN_CACHE
    
    # Check if we have a valid cached token
    current_time = time.time()
    if TOKEN_CACHE["access_token"] and TOKEN_CACHE["expires_at"] > current_time + 60:
        # Add a 60-second buffer to ensure token is still valid
        return TOKEN_CACHE["access_token"]
    
    # Get a new token
    client_id = os.environ.get("MOT_CLIENT_ID")
    client_secret = os.environ.get("MOT_CLIENT_SECRET")
    tenant_id = os.environ.get("MOT_TENANT_ID")
    
    if not all([client_id, client_secret, tenant_id]):
        raise HTTPException(
            status_code=500,
            detail="Missing authentication configuration. Check environment variables."
        )
    
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    
    payload = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'https://tapi.dvsa.gov.uk/.default'
    }
    
    headers = {
        'content-type': 'application/x-www-form-urlencoded'
    }
    
    try:
        response = requests.post(token_url, data=payload, headers=headers)
        response.raise_for_status()
        token_data = response.json()
        
        # Cache the token with its expiration time
        TOKEN_CACHE["access_token"] = token_data.get("access_token")
        # Convert expires_in (seconds) to absolute timestamp
        TOKEN_CACHE["expires_at"] = current_time + token_data.get("expires_in", 3600)
        
        return TOKEN_CACHE["access_token"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to authenticate with MOT API: {str(e)}")

# Helper functions
def is_cache_valid(cache_key):
    """Check if a cache entry is still valid."""
    if cache_key in VEHICLE_CACHE:
        cache_time = VEHICLE_CACHE[cache_key]["timestamp"]
        return (time.time() - cache_time) < CACHE_TTL
    return False

async def get_cached_vehicle_data(cache_key):
    """Get vehicle data from cache if available and valid."""
    if is_cache_valid(cache_key):
        return VEHICLE_CACHE[cache_key]["data"]
    return None

def update_vehicle_cache(cache_key, data):
    """Update the vehicle cache with new data."""
    VEHICLE_CACHE[cache_key] = {
        "data": data,
        "timestamp": time.time()
    }

async def get_vehicle_by_registration(registration: str, access_token: str) -> Dict[str, Any]:
    """Get vehicle details from the MOT API using registration number with caching."""
    # Check cache first
    cache_key = f"reg_{registration.upper()}"
    cached_data = await get_cached_vehicle_data(cache_key)
    if cached_data:
        return cached_data
    
    api_key = os.environ.get("MOT_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    base_url = "https://history.mot.api.gov.uk"
    endpoint = f"/v1/trade/vehicles/registration/{registration}"
    url = base_url + endpoint
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-API-Key": api_key
    }
    
    try:
        session = requests.Session()
        response = session.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Update cache
        update_vehicle_cache(cache_key, data)
        
        return data
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if err.response.status_code == 400:
            raise HTTPException(status_code=400, detail="Invalid registration format")
        
        # Try to extract error details from the API response
        try:
            error_data = err.response.json()
            error_code = error_data.get("errorCode", "Unknown")
            error_message = error_data.get("errorMessage", "No message provided")
            request_id = error_data.get("requestId", "Unknown")
            
            raise HTTPException(
                status_code=err.response.status_code,
                detail={
                    "errorCode": error_code,
                    "errorMessage": error_message,
                    "requestId": request_id
                }
            )
        except:
            # If we can't parse the error response, raise a generic error
            raise HTTPException(
                status_code=500,
                detail=f"Error accessing MOT API: {str(err)}"
            )

async def get_vehicle_by_vin(vin: str, access_token: str) -> Dict[str, Any]:
    """Get vehicle details from the MOT API using VIN with caching."""
    # Check cache first
    cache_key = f"vin_{vin.upper()}"
    cached_data = await get_cached_vehicle_data(cache_key)
    if cached_data:
        return cached_data
    
    api_key = os.environ.get("MOT_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    base_url = "https://history.mot.api.gov.uk"
    endpoint = f"/v1/trade/vehicles/vin/{vin}"
    url = base_url + endpoint
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-API-Key": api_key
    }
    
    try:
        session = requests.Session()
        response = session.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Update cache
        update_vehicle_cache(cache_key, data)
        
        return data
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if err.response.status_code == 400:
            raise HTTPException(status_code=400, detail="Invalid VIN format")
        
        # Try to extract error details from the API response
        try:
            error_data = err.response.json()
            error_code = error_data.get("errorCode", "Unknown")
            error_message = error_data.get("errorMessage", "No message provided")
            request_id = error_data.get("requestId", "Unknown")
            
            raise HTTPException(
                status_code=err.response.status_code,
                detail={
                    "errorCode": error_code,
                    "errorMessage": error_message,
                    "requestId": request_id
                }
            )
        except:
            # If we can't parse the error response, raise a generic error
            raise HTTPException(
                status_code=500,
                detail=f"Error accessing MOT API: {str(err)}"
            )

# API routes
@app.get("/")
async def root():
    """Root endpoint - basic API info"""
    return {
        "name": "MOT History API Service",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/vehicle/registration/{registration}",
            "/api/v1/vehicle/vin/{vin}"
        ]
    }

@app.get("/api/v1/vehicle/registration/{registration}", 
         response_model=Union[VehicleWithMot, NewRegVehicle],
         responses={
             404: {"model": ErrorResponse},
             400: {"model": ErrorResponse},
             500: {"model": ErrorResponse}
         })
async def get_vehicle_info_by_registration(
    registration: str,
    response: Response,
    access_token: str = Depends(get_access_token)
):
    """
    Get complete vehicle information and MOT history by registration number
    """
    # Check if data is from cache to set appropriate headers
    cache_key = f"reg_{registration.upper()}"
    is_cached = is_cache_valid(cache_key)
    
    vehicle_data = await get_vehicle_by_registration(registration, access_token)
    
    # Set cache control headers
    if is_cached:
        # If data was from cache, tell browser it's cached
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={CACHE_TTL}"
    else:
        # If data was freshly fetched, set the cache control
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"max-age={CACHE_TTL}"
    
    return vehicle_data

@app.get("/api/v1/vehicle/vin/{vin}", 
         response_model=Union[VehicleWithMot, NewRegVehicle],
         responses={
             404: {"model": ErrorResponse},
             400: {"model": ErrorResponse},
             500: {"model": ErrorResponse}
         })
async def get_vehicle_info_by_vin(
    vin: str,
    response: Response,
    access_token: str = Depends(get_access_token)
):
    """
    Get complete vehicle information and MOT history by VIN
    """
    # Check if data is from cache to set appropriate headers
    cache_key = f"vin_{vin.upper()}"
    is_cached = is_cache_valid(cache_key)
    
    vehicle_data = await get_vehicle_by_vin(vin, access_token)
    
    # Set cache control headers
    if is_cached:
        # If data was from cache, tell browser it's cached
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={CACHE_TTL}"
    else:
        # If data was freshly fetched, set the cache control
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = f"max-age={CACHE_TTL}"
    
    return vehicle_data

# Endpoint to manually clear the cache
@app.post("/api/v1/cache/clear")
async def clear_cache():
    """Clear all caches (tokens and vehicle data)"""
    global TOKEN_CACHE, VEHICLE_CACHE
    TOKEN_CACHE = {
        "access_token": None,
        "expires_at": 0,
    }
    VEHICLE_CACHE = {}
    return {"status": "success", "message": "Cache cleared successfully"}

# Main entry point for development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)