"""
Enhanced Vehicle API - Combined Repair Times and Technical Details
A FastAPI service providing both repair time data and technical specifications for vehicles
with improved matching logic and fuel type support
"""
import os
import re
import time
import logging
from datetime import datetime
import json
import asyncio
from typing import Optional, Dict, Any, List, Union, Tuple
from difflib import SequenceMatcher
from functools import lru_cache
from cachetools import TTLCache, cached

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
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
        logging.FileHandler("vehicle_data_api.log")
    ]
)
logger = logging.getLogger("vehicle_data_api")

# Constants and configuration
class Config:
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8005"))
    
    # Data directory settings
    VEHICLES_DATA_DIR = os.getenv("VEHICLES_DATA_DIR", "data/labour_times")
    TECH_SPECS_DIR = os.getenv("TECH_SPECS_DIR", "data/tech_specs")
    
    # Security settings
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",")
    
    # Caching settings
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour by default
    CACHE_MAXSIZE = int(os.getenv("CACHE_MAXSIZE", "1000"))
    
    # Rate limiting settings
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "1"))  # 5 requests per second
    
    # Matching settings
    MIN_MATCH_SCORE = float(os.getenv("MIN_MATCH_SCORE", "0.6"))  # Minimum similarity score
    
    # Year handling settings
    PIVOT_YEAR = int(os.getenv("PIVOT_YEAR", "50"))  # Years below 50 are 2000s, above are 1900s

# Models
class VehicleDataRequest(BaseModel):
    vehicleData: Dict[str, Any]

class TechSpecsRequest(BaseModel):
    vehicleData: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    cacheSize: int
    availableVehicles: int
    availableTechSpecs: int

# Initialize caches using cachetools
vehicle_cache = TTLCache(maxsize=Config.CACHE_MAXSIZE, ttl=Config.CACHE_TTL)
tech_specs_cache = TTLCache(maxsize=Config.CACHE_MAXSIZE, ttl=Config.CACHE_TTL)

# Storage for vehicle data and indexes
vehicle_data = {}  # For repair times
tech_specs_data = {}  # For technical specifications
vehicle_index = {}  # Combined index for both types

# FastAPI application
app = FastAPI(
    title="Vehicle Data API",
    description="API service providing repair time data and technical specifications for vehicles",
    version="1.2.0",
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

        # Only rate limit the vehicle endpoints
        if "/api/v1/" in request.url.path and request.method in ["GET", "POST"]:
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

    # Log message with essential details
    log_message = (
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host} - "
        f"Status: {response.status_code} - "
        f"Process Time: {process_time:.4f}s"
    )

    if response.status_code >= 400:
        logger.warning(log_message)
    else:
        logger.info(log_message)

    return response

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Cache", "Cache-Control", "Content-Type", "X-Data-Type"],
    max_age=86400,  # Cache preflight requests for 24 hours
)
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(RateLimiterMiddleware)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An unexpected error occurred"}
    )

# Helper function to determine data type
def determine_data_type(data):
    """Determine if the data is repair times or technical specifications"""
    # Technical specs have specific sections like engineData, brakes, etc.
    if any(key in data for key in ["engineData", "brakes", "cooling", "exhaust", "climate", "electrical"]):
        return "tech_specs"
    # Repair times data might have repairTimes or similar key
    elif "repairTimes" in data or "vehicleRepairTimes" in data:
        return "repair_times"
    # Just basic vehicle identification
    else:
        # Check for detailed specifications sections that indicate tech specs
        if any(key in data for key in ["injectionSystem", "tuningEmissions", "brakeDimensions", "tighteningTorques"]):
            return "tech_specs"
        return "repair_times"

# General model normalization function
def normalize_model_name(model_name):
    """
    Normalize model names for better matching across different formats.
    Works for all vehicle makes/models by applying general rules.
    """
    if not model_name:
        return model_name
        
    # Convert to lowercase and trim
    model_name = model_name.lower().strip()
    
    # Remove common variant indicators and technical codes after main model name
    clean_name = re.sub(r'(?<=\w)[\s\-][a-z0-9][\w\d\/]+$', '', model_name)
    
    # If we drastically changed the string, use the simpler version
    if len(clean_name) < len(model_name) * 0.6:
        return model_name  # Return original if too much was removed
    
    return clean_name

# General base model extraction function
def extract_base_model(model_name):
    """
    Extract base model from full model name.
    Works for all vehicle types using common patterns.
    """
    if not model_name:
        return model_name
        
    model_name = model_name.lower().strip()
    
    # Match patterns that indicate the end of a base model name
    patterns = [
        r'^([a-z0-9\-\s]+?)[\s\-]+\d+\.?\d*\w*',  # Stop at engine size/variant (2.0, 1.8T)
        r'^([a-z0-9\-\s]+?)[\s\-]+[a-z]{2,}',     # Stop at letter variants (GTI, Sport)
        r'^([a-z0-9\-]+?)[\s\-]?[a-z]?\d+[\w\/]', # Stop at technical codes
        r'^([a-z0-9\-]+)',                        # Fallback: take alphanumeric prefix
    ]
    
    for pattern in patterns:
        match = re.match(pattern, model_name)
        if match:
            base = match.group(1).strip()
            # Only use the result if it's a significant portion of the original
            if len(base) >= min(3, len(model_name) * 0.5):
                return base
    
    return model_name  # Return original if no patterns match

# Improved year extraction - handles pre-2000 years correctly
def extract_year_info(text: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Extract start and end years from text (model type, filename, etc.)
    Returns tuple of (start_year, end_year) where end_year can be None
    """
    if not text:
        return None, None
    
    # Define pivot year for century determination
    pivot_year = Config.PIVOT_YEAR
    
    def expand_year(year_short):
        """Expands a 2-digit year to 4 digits using pivot year logic."""
        year_int = int(year_short)
        if year_int < pivot_year:
            return int(f"20{year_short}")
        else:
            return int(f"19{year_short}")
            
    # Comprehensive pattern matching for various formats
    patterns = [
        # 2-digit years: (07-14), (07-present), (90-16)
        r'\((\d{2})-(\d{2})\)',
        r'\((\d{2})\+\)',
        r'\((\d{2})-present\)',
        # 4-digit years: (2007-2014), (2007+), (2007-present)
        r'\((\d{4})-(\d{4})\)',
        r'\((\d{4})[\-\+](\d{4})\)',
        r'(\d{4})-(\d{4})',
        r'\((\d{4})\+\)',
        r'(\d{4})\+',
        r'\((\d{4})-present\)',
        # Year in quotes: ('17)
        r"\'(\d{2})\)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            start_year = match.group(1)
            
            # Convert 2-digit years to 4-digit using pivot logic
            if len(start_year) == 2:
                start_year = expand_year(start_year)
            else:
                start_year = int(start_year)
                
            # Handle end year if it exists
            if len(match.groups()) > 1 and match.group(2):
                end_year = match.group(2)
                if end_year.lower() == 'present':
                    end_year = None
                else:
                    # Convert 2-digit years to 4-digit using pivot logic
                    if len(end_year) == 2:
                        end_year = expand_year(end_year)
                    else:
                        end_year = int(end_year)
                return start_year, end_year
            
            return start_year, None
    
    # If just a 4-digit year appears somewhere in the string
    match = re.search(r'(\d{4})', text)
    if match:
        return int(match.group(1)), int(match.group(1))
        
    return None, None

# Function to detect fuel type
def detect_fuel_type(data):
    """
    Detect fuel type from vehicle technical specifications data
    Returns "petrol", "diesel", or "unknown"
    """
    # Check for spark plugs (clear petrol indicator)
    if "spark_plugs" in data:
        return "petrol"
    
    # Check for injection system details that might indicate diesel
    if "injectionSystem" in data:
        injection_text = json.dumps(data["injectionSystem"]).lower()
        if any(term in injection_text for term in ["diesel", "cdi", "tdi", "hdi", "crdi"]):
            return "diesel"
    
    # Check for glow plugs (diesel indicator)
    if "glow_plugs" in data:
        return "diesel"
    
    # Check for fuel system information
    if "fuel_system" in data:
        fuel_text = json.dumps(data["fuel_system"]).lower()
        if "common rail" in fuel_text or "injection pump" in fuel_text:
            return "diesel"
    
    # Check vehicle identification for diesel indicators
    if "vehicleIdentification" in data:
        model = data["vehicleIdentification"].get("model", "").lower()
        title = data["vehicleIdentification"].get("title", "").lower()
        
        diesel_indicators = ["cdi", "tdi", "hdi", "dci", "crdi", "d4d", "jtd", "tdci"]
        for indicator in diesel_indicators:
            if indicator in model or indicator in title:
                return "diesel"
    
    # General text search throughout the document
    json_str = json.dumps(data).lower()
    if "diesel" in json_str and "spark plug" not in json_str:
        return "diesel"
    elif "spark plug" in json_str:
        return "petrol"
    
    # Default to unknown if we can't determine
    return "unknown"

# Enhanced model matching function
def calculate_model_match_score(requested_model, db_model, db_base_model=None):
    """
    Calculate match score between requested model and database model.
    Uses multiple techniques to determine similarity.
    """
    requested_model = requested_model.lower().strip()
    db_model = db_model.lower().strip()
    db_base_model = db_base_model.lower().strip() if db_base_model else ""
    
    # 1. Exact match check
    exact_match_score = 1.0 if requested_model == db_model else 0.0
    
    # 2. Base model match check
    base_model_match_score = 0.0
    if db_base_model and requested_model == db_base_model:
        base_model_match_score = 0.95  # Slightly less than exact match
    
    # 3. Request is contained in database model
    contains_match_score = 0.0
    if requested_model in db_model:
        # Better score if it's at the beginning
        position_factor = 1.0 if db_model.startswith(requested_model) else 0.8
        
        # Better score if the requested model makes up more of the database model
        coverage_ratio = len(requested_model) / len(db_model)
        significance_factor = min(1.0, coverage_ratio * 2)  # Scale up but cap at 1.0
        
        contains_match_score = 0.9 * position_factor * significance_factor
    
    # 4. Database model is contained in requested model
    reverse_contains_score = 0.0
    if db_model in requested_model:
        # Check how much of the requested model is covered
        coverage_ratio = len(db_model) / len(requested_model)
        reverse_contains_score = 0.7 * coverage_ratio
    
    # 5. Clean and normalize both for comparison
    cleaned_req_model = re.sub(r'[^\w]', '', requested_model)
    cleaned_db_model = re.sub(r'[^\w]', '', db_model)
    
    cleaned_match_score = 0.0
    if cleaned_req_model == cleaned_db_model:
        cleaned_match_score = 0.95
    elif cleaned_db_model.startswith(cleaned_req_model):
        coverage_ratio = len(cleaned_req_model) / len(cleaned_db_model)
        cleaned_match_score = 0.8 * coverage_ratio
    
    # 6. Token-based matching (for multi-word models)
    token_match_score = 0.0
    if " " in requested_model or " " in db_model:
        req_tokens = requested_model.split()
        db_tokens = db_model.split()
        common_tokens = set(req_tokens) & set(db_tokens)
        
        if common_tokens:
            # Score based on how many tokens match
            req_coverage = len(common_tokens) / len(req_tokens)
            db_coverage = len(common_tokens) / len(db_tokens)
            token_match_score = 0.85 * (req_coverage + db_coverage) / 2
    
    # 7. Levenshtein distance as fallback
    levenshtein_score = SequenceMatcher(None, requested_model, db_model).ratio()
    
    # Take best score from all methods
    model_score = max(
        exact_match_score,
        base_model_match_score,
        contains_match_score,
        reverse_contains_score,
        cleaned_match_score,
        token_match_score,
        levenshtein_score * 0.7  # Downweight Levenshtein
    )
    
    # Log detailed scores for debugging
    logger.debug(f"Model match details for '{requested_model}' vs '{db_model}':")
    logger.debug(f"  - Exact: {exact_match_score:.2f} | Base: {base_model_match_score:.2f}")
    logger.debug(f"  - Contains: {contains_match_score:.2f} | RevContains: {reverse_contains_score:.2f}")
    logger.debug(f"  - Cleaned: {cleaned_match_score:.2f} | Token: {token_match_score:.2f}")
    logger.debug(f"  - Levenshtein: {levenshtein_score:.2f}")
    logger.debug(f"  - FINAL SCORE: {model_score:.2f}")
    
    return model_score

# Function to load vehicle data - enhanced with improved model parsing
def load_all_vehicle_data():
    """Load all vehicle data files from the directories with improved model parsing"""
    global vehicle_data, tech_specs_data
    
    # Reset data stores
    vehicle_data = {}
    tech_specs_data = {}
    
    # Load repair times data
    try:
        # Ensure the directory exists
        os.makedirs(Config.VEHICLES_DATA_DIR, exist_ok=True)
        
        # List all JSON files in the labour times directory
        json_files = [f for f in os.listdir(Config.VEHICLES_DATA_DIR) if f.endswith('.json')]
        logger.info(f"Found {len(json_files)} vehicle labour time data files")
        
        for json_file in json_files:
            file_path = os.path.join(Config.VEHICLES_DATA_DIR, json_file)
            try:
                with open(file_path, 'r') as f:
                    file_data = json.load(f)
                    
                    # Basic validation
                    if "vehicleIdentification" not in file_data:
                        logger.warning(f"Skipping {json_file}: missing vehicleIdentification")
                        continue
                    
                    # Extract make and model
                    vehicle_id = file_data["vehicleIdentification"]
                    make = vehicle_id.get("make", "")
                    model = vehicle_id.get("model", "")
                    model_type = vehicle_id.get("modelType", "")
                    
                    if not make or not model:
                        logger.warning(f"Skipping {json_file}: missing make or model")
                        continue
                    
                    # Create key for fast lookup
                    basic_key = f"{make}_{model}".lower().replace(" ", "_")
                    vehicle_data[basic_key] = file_data
                    
                    # Extract base model using our general function
                    base_model = extract_base_model(model)
                    if base_model != model:
                        base_key = f"{make}_{base_model}".lower().replace(" ", "_")
                        vehicle_data[base_key] = file_data
                    
                    # Add normalized model keys
                    normalized_model = normalize_model_name(model)
                    if normalized_model != model.lower().strip():
                        normalized_key = f"{make}_{normalized_model}".lower().replace(" ", "_")
                        vehicle_data[normalized_key] = file_data
                    
                    # Extract year range if present in the model type or filename
                    start_year, end_year = extract_year_info(model_type or json_file)
                    
                    # Store with year-specific keys if years are available
                    if start_year:
                        # Base year key
                        year_key = f"{make}_{model}_{start_year}".lower().replace(" ", "_")
                        vehicle_data[year_key] = file_data
                        
                        # Base model + year
                        if base_model != model:
                            base_year_key = f"{make}_{base_model}_{start_year}".lower().replace(" ", "_")
                            vehicle_data[base_year_key] = file_data
                        
                        # Normalized model + year
                        if normalized_model != model.lower().strip():
                            norm_year_key = f"{make}_{normalized_model}_{start_year}".lower().replace(" ", "_")
                            vehicle_data[norm_year_key] = file_data
                        
                        # For files with a year range, create entries for specific years
                        if end_year and end_year > start_year:
                            for year in range(start_year, end_year + 1):
                                # Year-specific key
                                year_key = f"{make}_{model}_{year}".lower().replace(" ", "_")
                                vehicle_data[year_key] = file_data
                                
                                # Base model + year
                                if base_model != model:
                                    base_year_key = f"{make}_{base_model}_{year}".lower().replace(" ", "_")
                                    vehicle_data[base_year_key] = file_data
                                
                                # Normalized model + year
                                if normalized_model != model.lower().strip():
                                    norm_year_key = f"{make}_{normalized_model}_{year}".lower().replace(" ", "_")
                                    vehicle_data[norm_year_key] = file_data
                    
                    logger.info(f"Loaded repair data for {make} {model} {model_type}")
                    
            except Exception as e:
                logger.error(f"Error loading labour time file {json_file}: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to load labour time data: {str(e)}")
    
    # Load technical specifications data with similar approach
    try:
        # Ensure the directory exists
        os.makedirs(Config.TECH_SPECS_DIR, exist_ok=True)
        
        # List all JSON files in the tech specs directory
        json_files = [f for f in os.listdir(Config.TECH_SPECS_DIR) if f.endswith('.json')]
        logger.info(f"Found {len(json_files)} vehicle technical specification files")
        
        for json_file in json_files:
            file_path = os.path.join(Config.TECH_SPECS_DIR, json_file)
            try:
                with open(file_path, 'r') as f:
                    file_data = json.load(f)
                    
                    # Basic validation
                    if "vehicleIdentification" not in file_data:
                        logger.warning(f"Skipping tech spec {json_file}: missing vehicleIdentification")
                        continue
                    
                    # Extract make and model
                    vehicle_id = file_data["vehicleIdentification"]
                    make = vehicle_id.get("make", "")
                    model = vehicle_id.get("model", "")
                    model_type = vehicle_id.get("modelType", "")
                    
                    # Detect and store fuel type
                    fuel_type = detect_fuel_type(file_data)
                    file_data["vehicleIdentification"]["fuelType"] = fuel_type
                    logger.info(f"Detected fuel type for {make} {model}: {fuel_type}")
                    
                    if not make or not model:
                        logger.warning(f"Skipping tech spec {json_file}: missing make or model")
                        continue
                    
                    # Extract base model using the general function
                    base_model = extract_base_model(model)
                    
                    # Get normalized model
                    normalized_model = normalize_model_name(model)
                    
                    # Create standard keys for lookup
                    basic_key = f"{make}_{model}".lower().replace(" ", "_")
                    tech_specs_data[basic_key] = file_data
                    
                    # Create base model key if different from full model
                    if base_model != model:
                        base_model_key = f"{make}_{base_model}".lower().replace(" ", "_")
                        tech_specs_data[base_model_key] = file_data
                    
                    # Add normalized model key
                    if normalized_model != model.lower().strip():
                        normalized_key = f"{make}_{normalized_model}".lower().replace(" ", "_")
                        tech_specs_data[normalized_key] = file_data
                    
                    # Create fuel-specific key
                    fuel_key = f"{make}_{model}_{fuel_type}".lower().replace(" ", "_")
                    tech_specs_data[fuel_key] = file_data
                    
                    # Create base model + fuel key if applicable
                    if base_model != model:
                        base_fuel_key = f"{make}_{base_model}_{fuel_type}".lower().replace(" ", "_")
                        tech_specs_data[base_fuel_key] = file_data
                    
                    # Create normalized model + fuel key
                    if normalized_model != model.lower().strip():
                        norm_fuel_key = f"{make}_{normalized_model}_{fuel_type}".lower().replace(" ", "_")
                        tech_specs_data[norm_fuel_key] = file_data
                    
                    # Extract year range if present
                    start_year, end_year = extract_year_info(model_type or json_file)
                    
                    # Store with year-specific keys
                    if start_year:
                        # Year-specific keys
                        year_key = f"{make}_{model}_{start_year}".lower().replace(" ", "_")
                        tech_specs_data[year_key] = file_data
                        
                        # Base model + year key
                        if base_model != model:
                            base_year_key = f"{make}_{base_model}_{start_year}".lower().replace(" ", "_")
                            tech_specs_data[base_year_key] = file_data
                        
                        # Normalized model + year key
                        if normalized_model != model.lower().strip():
                            norm_year_key = f"{make}_{normalized_model}_{start_year}".lower().replace(" ", "_")
                            tech_specs_data[norm_year_key] = file_data
                        
                        # Fuel + year combined key for precise matching
                        fuel_year_key = f"{make}_{model}_{fuel_type}_{start_year}".lower().replace(" ", "_")
                        tech_specs_data[fuel_year_key] = file_data
                        
                        # Base model + fuel + year key
                        if base_model != model:
                            base_fuel_year_key = f"{make}_{base_model}_{fuel_type}_{start_year}".lower().replace(" ", "_")
                            tech_specs_data[base_fuel_year_key] = file_data
                        
                        # Normalized model + fuel + year key
                        if normalized_model != model.lower().strip():
                            norm_fuel_year_key = f"{make}_{normalized_model}_{fuel_type}_{start_year}".lower().replace(" ", "_")
                            tech_specs_data[norm_fuel_year_key] = file_data
                        
                        # For year ranges, create entries for all years in range
                        if end_year and end_year > start_year:
                            for year in range(start_year, end_year + 1):
                                # Year-specific key
                                year_specific_key = f"{make}_{model}_{year}".lower().replace(" ", "_")
                                tech_specs_data[year_specific_key] = file_data
                                
                                # Base model + year key
                                if base_model != model:
                                    base_year_specific_key = f"{make}_{base_model}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[base_year_specific_key] = file_data
                                
                                # Normalized model + year key
                                if normalized_model != model.lower().strip():
                                    norm_year_specific_key = f"{make}_{normalized_model}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[norm_year_specific_key] = file_data
                                
                                # Year + fuel specific key
                                fuel_year_specific_key = f"{make}_{model}_{fuel_type}_{year}".lower().replace(" ", "_")
                                tech_specs_data[fuel_year_specific_key] = file_data
                                
                                # Base model + fuel + year key
                                if base_model != model:
                                    base_fuel_year_specific_key = f"{make}_{base_model}_{fuel_type}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[base_fuel_year_specific_key] = file_data
                                
                                # Normalized model + fuel + year key
                                if normalized_model != model.lower().strip():
                                    norm_fuel_year_specific_key = f"{make}_{normalized_model}_{fuel_type}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[norm_fuel_year_specific_key] = file_data
                                
                                # Year-specific key without fuel type - for matching just by year
                                year_key_no_fuel = f"{make}_{model}_{year}".lower().replace(" ", "_")
                                tech_specs_data[year_key_no_fuel] = file_data
                                
                                # Base model + year key without fuel type
                                if base_model != model:
                                    base_year_key_no_fuel = f"{make}_{base_model}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[base_year_key_no_fuel] = file_data
                                
                                # Normalized model + year without fuel type
                                if normalized_model != model.lower().strip():
                                    norm_year_key_no_fuel = f"{make}_{normalized_model}_{year}".lower().replace(" ", "_")
                                    tech_specs_data[norm_year_key_no_fuel] = file_data
                    
                    logger.info(f"Loaded tech specs for {make} {model} {model_type} ({fuel_type})")
                    
            except Exception as e:
                logger.error(f"Error loading tech spec file {json_file}: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to load technical specification data: {str(e)}")
    
    return vehicle_data, tech_specs_data

# Enhanced index building function
def build_vehicle_index():
    """Build unified index with fuel type information"""
    global vehicle_index
    vehicle_index = {}
    
    # Process repair times data
    for key, data in vehicle_data.items():
        # Skip year-specific keys to avoid duplication
        if re.search(r'_\d{4}$', key):
            continue
            
        vehicle_id = data["vehicleIdentification"]
        make = vehicle_id.get("make", "")
        model = vehicle_id.get("model", "")
        model_type = vehicle_id.get("modelType", "")
        title = vehicle_id.get("title", "")
        
        # Extract base model with improved function
        base_model = extract_base_model(model)
        
        # Extract year range from model type or title
        start_year, end_year = extract_year_info(model_type or title or key)
        
        # Store enhanced metadata
        if key not in vehicle_index:
            vehicle_index[key] = {
                "make": make,
                "model": model,
                "baseModel": base_model,
                "modelType": model_type,
                "key": key,
                "startYear": start_year,
                "endYear": end_year,
                "title": title,
                "dataTypes": ["repair_times"]
            }
        else:
            vehicle_index[key]["dataTypes"].append("repair_times")
    
    # Process technical specifications data
    for key, data in tech_specs_data.items():
        # Skip derived keys to avoid duplication
        if re.search(r'_(petrol|diesel|unknown)(_\d{4})?$', key) or re.search(r'_\d{4}$', key):
            continue
            
        vehicle_id = data["vehicleIdentification"]
        make = vehicle_id.get("make", "")
        model = vehicle_id.get("model", "")
        model_type = vehicle_id.get("modelType", "")
        title = vehicle_id.get("title", "")
        fuel_type = vehicle_id.get("fuelType", "unknown")
        
        # Extract base model with improved function
        base_model = extract_base_model(model)
        
        # Extract year range from model type or title
        start_year, end_year = extract_year_info(model_type or title or key)
        
        # Store enhanced metadata with fuel type
        if key not in vehicle_index:
            vehicle_index[key] = {
                "make": make,
                "model": model,
                "baseModel": base_model,
                "modelType": model_type,
                "key": key,
                "startYear": start_year,
                "endYear": end_year,
                "title": title,
                "fuelType": fuel_type,
                "dataTypes": ["tech_specs"]
            }
        else:
            if "tech_specs" not in vehicle_index[key]["dataTypes"]:
                vehicle_index[key]["dataTypes"].append("tech_specs")
            
            # Add fuel type if not already set
            if "fuelType" not in vehicle_index[key]:
                vehicle_index[key]["fuelType"] = fuel_type
            
            # Add base model if not already set
            if "baseModel" not in vehicle_index[key]:
                vehicle_index[key]["baseModel"] = base_model
    
    logger.info(f"Built index with {len(vehicle_index)} vehicles, including fuel type and base model information")
    return vehicle_index

# Enhanced vehicle matching function with general model matching
def find_vehicle_match(make: str, model: str, year: Optional[int] = None, fuel_type: Optional[str] = None, data_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Enhanced vehicle matching with general model matching logic
    """
    if not vehicle_index:
        logger.error("Vehicle index not built")
        return None
    
    normalized_make = make.lower().strip()
    normalized_model = model.lower().strip()
    normalized_fuel_type = fuel_type.lower().strip() if fuel_type else None
    
    # Store candidates with scores
    candidates = []
    
    # Log search criteria
    logger.info(f"Searching for: {normalized_make} {normalized_model}, Year={year}, Fuel={normalized_fuel_type}, Type={data_type}")
    
    # First try exact make matching
    make_matches = [v for k, v in vehicle_index.items() 
                   if v["make"].lower().strip() == normalized_make]
    
    # Filter by data type if specified
    if data_type and make_matches:
        make_matches = [v for v in make_matches if data_type in v["dataTypes"]]
    
    if make_matches:
        logger.info(f"Found {len(make_matches)} vehicles matching make '{normalized_make}'")
        
        for vehicle in make_matches:
            db_model = vehicle["model"].lower().strip()
            db_base_model = vehicle.get("baseModel", "").lower().strip()
            db_fuel_type = vehicle.get("fuelType", "unknown").lower()
            
            # Calculate model match score using the enhanced function
            model_score = calculate_model_match_score(normalized_model, db_model, db_base_model)
            
            # Calculate fuel type score
            fuel_score = 0.0
            if normalized_fuel_type and db_fuel_type != "unknown":
                if normalized_fuel_type == db_fuel_type:
                    # Perfect match
                    fuel_score = 1.0
                else:
                    # Different fuel types - reduced penalty
                    fuel_score = 0.4  # Less severe penalty for fuel type mismatch
            elif not normalized_fuel_type or db_fuel_type == "unknown":
                # If either is unknown, neutral score
                fuel_score = 0.5
            
            # Calculate year score
            year_score = 0.0
            year_match_reason = "No year specified"
            
            if year and vehicle.get("startYear"):
                start_year = vehicle.get("startYear")
                end_year = vehicle.get("endYear")
                
                # Log year range
                year_range = f"{start_year}-{end_year or 'present'}"
                logger.debug(f"Checking year {year} against range {year_range}")
                
                # Perfect match if in range
                if end_year is None:  # Ongoing model
                    if year >= start_year:
                        year_score = 1.0
                        year_match_reason = f"Year {year} >= start year {start_year} (ongoing model)"
                    else:
                        # Penalty for being before start year
                        year_distance = start_year - year
                        year_score = max(0.0, 1.0 - (0.1 * year_distance))
                        year_match_reason = f"Year {year} is {year_distance} years before ongoing model start {start_year}"
                else:  # Specific year range
                    if start_year <= year <= end_year:
                        # In range - perfect score
                        year_score = 1.0
                        year_match_reason = f"Year {year} is within range {start_year}-{end_year}"
                    else:
                        # Calculate penalty based on distance from range
                        if year < start_year:
                            year_distance = start_year - year
                            year_score = max(0.0, 1.0 - (0.1 * year_distance))
                            year_match_reason = f"Year {year} is {year_distance} years before range {start_year}-{end_year}"
                        else:  # year > end_year
                            year_distance = year - end_year
                            year_score = max(0.0, 1.0 - (0.1 * year_distance))
                            year_match_reason = f"Year {year} is {year_distance} years after range {start_year}-{end_year}"
            
            logger.debug(f"Year scoring: {year_score:.2f} - {year_match_reason}")
            
            # Weighting factors based on available data
            model_weight = 0.6  # Base weight for model
            year_weight = 0.0
            fuel_weight = 0.0
            
            # Adjust weights based on available criteria
            if year and normalized_fuel_type:
                # We have all three criteria - reduced fuel weight
                model_weight = 0.6
                year_weight = 0.3
                fuel_weight = 0.1  # Reduced from 0.2 to 0.1
            elif year and not normalized_fuel_type:
                # We have make, model, and year
                model_weight = 0.6
                year_weight = 0.4
            elif normalized_fuel_type and not year:
                # We have make, model, and fuel type - reduced fuel weight
                model_weight = 0.8  # Increased from 0.7
                fuel_weight = 0.2  # Reduced from 0.3
            
            # Calculate final score
            combined_score = model_score * model_weight
            if year:
                combined_score += year_score * year_weight
            if normalized_fuel_type:
                combined_score += fuel_score * fuel_weight
            
            # Boost score for exact make matches
            if normalized_make == vehicle["make"].lower():
                combined_score *= 1.1
                combined_score = min(combined_score, 1.0)  # Cap at 1.0
            
            # Add detailed matching info to candidate
            candidate_info = {
                "vehicle": vehicle,
                "score": combined_score,
                "debug_info": {
                    "model_score": model_score,
                    "year_score": year_score,
                    "year_reason": year_match_reason,
                    "fuel_score": fuel_score if normalized_fuel_type else None,
                    "db_model": db_model,
                    "db_base_model": db_base_model,
                    "db_fuel_type": db_fuel_type,
                    "weights": {"model": model_weight, "year": year_weight, "fuel": fuel_weight}
                }
            }
            
            # Add to candidates if score is reasonable
            if model_score > 0.4 or (year and year_score > 0.8) or (normalized_fuel_type and fuel_score > 0.8):
                candidates.append(candidate_info)
    
    # If no exact make matches or if candidates list is empty, try fuzzy matching on make
    if not candidates:
        logger.info(f"No candidates with exact make match, trying fuzzy make matching")
        for key, vehicle in vehicle_index.items():
            # Skip if data type doesn't match
            if data_type and data_type not in vehicle["dataTypes"]:
                continue
                
            # Calculate make similarity
            make_score = SequenceMatcher(None, normalized_make, vehicle["make"].lower()).ratio()
            
            # Skip poor make matches for efficiency
            if make_score < 0.7:  # High threshold for make
                continue
                
            db_model = vehicle["model"].lower().strip()
            db_base_model = vehicle.get("baseModel", "").lower().strip()
            db_fuel_type = vehicle.get("fuelType", "unknown").lower()
            
            # Use our general model matching function
            model_score = calculate_model_match_score(normalized_model, db_model, db_base_model)
            
            # Calculate year and fuel scores as before
            year_score = 0.0
            if year and vehicle.get("startYear"):
                start_year = vehicle.get("startYear")
                end_year = vehicle.get("endYear")
                
                if end_year is None:
                    year_score = 1.0 if year >= start_year else max(0.0, 1.0 - (0.1 * (start_year - year)))
                else:
                    if start_year <= year <= end_year:
                        year_score = 1.0
                    else:
                        distance = min(abs(year - start_year), abs(year - end_year))
                        year_score = max(0.0, 1.0 - (0.1 * distance))
            
            fuel_score = 0.0
            if normalized_fuel_type and db_fuel_type != "unknown":
                fuel_score = 1.0 if normalized_fuel_type == db_fuel_type else 0.4  # Reduced penalty
            elif not normalized_fuel_type or db_fuel_type == "unknown":
                fuel_score = 0.5
            
            # Adjusted weights - make match is more important for fuzzy matches
            model_weight = 0.4
            make_weight = 0.3
            year_weight = 0.2 if year else 0.0
            fuel_weight = 0.1 if normalized_fuel_type else 0.0
            
            if not year and not normalized_fuel_type:
                make_weight = 0.4
                model_weight = 0.6
            
            # Calculate final score including make similarity
            combined_score = (model_score * model_weight) + (make_score * make_weight)
            if year:
                combined_score += year_score * year_weight
            if normalized_fuel_type:
                combined_score += fuel_score * fuel_weight
            
            # Add to candidates if reasonable match
            if combined_score > 0.6:
                candidates.append({
                    "vehicle": vehicle,
                    "score": combined_score,
                    "debug_info": {
                        "make_score": make_score,
                        "model_score": model_score,
                        "year_score": year_score if year else None,
                        "fuel_score": fuel_score if normalized_fuel_type else None
                    }
                })
    
    # Sort candidates by score
    candidates.sort(key=lambda x: x["score"], reverse=True)
    
    # Log top candidates
    if candidates:
        logger.info(f"Top {min(3, len(candidates))} matching candidates:")
        for i, candidate in enumerate(candidates[:3]):
            v = candidate["vehicle"]
            logger.info(
                f"#{i+1}: {v['make']} {v['model']} "
                f"({v.get('startYear')}-{v.get('endYear') or 'present'}) "
                f"Fuel: {v.get('fuelType', 'unknown')} - "
                f"Score: {candidate['score']:.2f}"
            )
    
    # Dynamic threshold adjustment - with generalized criteria
    matching_threshold = Config.MIN_MATCH_SCORE
    
    # Lower threshold for excellent year matches regardless of other factors 
    if year and candidates and candidates[0]["debug_info"].get("year_score", 0) > 0.9:
        matching_threshold = max(0.25, matching_threshold - 0.25)
        logger.info(f"Lowered threshold to {matching_threshold} due to excellent year match")
    
    # Year + good model match but fuel type difference 
    elif year and normalized_fuel_type and candidates and candidates[0]["debug_info"].get("model_score", 0) > 0.7:
        matching_threshold = max(0.35, matching_threshold - 0.2)
        logger.info(f"Lowered threshold to {matching_threshold} due to good model and year match despite fuel type difference")
    
    # Excellent fuel type match
    elif normalized_fuel_type and candidates and candidates[0]["debug_info"].get("fuel_score", 0) > 0.9:
        matching_threshold = max(0.4, matching_threshold - 0.15)
        logger.info(f"Lowered threshold to {matching_threshold} due to excellent fuel match")
    
    # General low threshold for any case with an excellent model score
    elif candidates and candidates[0]["debug_info"].get("model_score", 0) > 0.85:
        matching_threshold = max(0.3, matching_threshold - 0.2)
        logger.info(f"Lowered threshold to {matching_threshold} due to excellent model match score")
    
    # Return best match if it meets threshold
    if candidates and candidates[0]["score"] > matching_threshold:
        best_match = candidates[0]["vehicle"]
        logger.info(
            f"Selected match: {best_match['make']} {best_match['model']} "
            f"({best_match.get('startYear')}-{best_match.get('endYear') or 'present'}) "
            f"Fuel: {best_match.get('fuelType', 'unknown')} "
            f"with score: {candidates[0]['score']:.2f}"
        )
        return best_match
    
    # Log failure
    logger.info(f"No good match found for {make} {model} (Year: {year}, Fuel: {fuel_type})")
    
    # Show similar models for debugging
    similar_keys = [k for k in tech_specs_data.keys() 
                   if normalized_make in k and len(k) < 40]
    if similar_keys:
        logger.info(f"Similar tech spec keys available: {similar_keys}")
    
    return None

# API routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.2.0",
        "cacheSize": len(vehicle_cache) + len(tech_specs_cache),
        "availableVehicles": len(vehicle_data),
        "availableTechSpecs": len(tech_specs_data)
    }

@app.get("/api/v1/vehicles")
async def get_vehicles(data_type: Optional[str] = None):
    """
    Get list of all available vehicles
    
    Args:
        data_type: Optional filter by data type ('repair_times', 'tech_specs')
    """
    if not vehicle_index:
        raise HTTPException(status_code=500, detail="Vehicle index not built")
        
    vehicles = []
    for key, vehicle in vehicle_index.items():
        # Filter by data type if specified
        if data_type and data_type not in vehicle["dataTypes"]:
            continue
            
        # Include year range information if available
        year_info = {}
        if vehicle.get("startYear"):
            year_info = {
                "startYear": vehicle["startYear"],
                "endYear": vehicle["endYear"] or "present"
            }
            
        # Include vehicle information
        vehicle_data = {
            "make": vehicle["make"],
            "model": vehicle["model"],
            "modelType": vehicle["modelType"],
            "key": key,
            "dataTypes": vehicle["dataTypes"]
        }
        
        # Add fuel type if available
        if "fuelType" in vehicle:
            vehicle_data["fuelType"] = vehicle["fuelType"]
            
        # Add year range if available
        if year_info:
            vehicle_data["yearRange"] = year_info
            
        vehicles.append(vehicle_data)
    
    return {"vehicles": vehicles, "count": len(vehicles)}

@app.get("/api/v1/vehicles/{make}/{model}")
@cached(cache=vehicle_cache)
async def get_vehicle_repair_times(
    make: str, 
    model: str, 
    response: Response,
    year: Optional[int] = None,
):
    """
    Get repair times for a specific vehicle by make and model.
    Optional year parameter for more precise matching.
    """
    if not vehicle_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Vehicle data not loaded")
        
    # Set cache headers
    response.headers["X-Cache"] = "HIT"  # cachetools handles the actual caching
    response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
    response.headers["X-Data-Type"] = "repair_times"
    
    # Log the lookup request for debugging
    logger.info(f"Looking up repair times for: {make} {model} (year: {year})")
    
    # Try direct lookup based on make, model and year
    key = f"{make}_{model}".lower().replace(" ", "_")
    if year:
        year_key = f"{make}_{model}_{year}".lower().replace(" ", "_")
        if year_key in vehicle_data:
            logger.info(f"Direct year match found with key: {year_key}")
            return vehicle_data[year_key]
    
    # Try normalized model for better matching
    normalized_model = normalize_model_name(model)
    if normalized_model != model.lower().strip():
        norm_key = f"{make}_{normalized_model}".lower().replace(" ", "_")
        if year:
            norm_year_key = f"{make}_{normalized_model}_{year}".lower().replace(" ", "_")
            if norm_year_key in vehicle_data:
                logger.info(f"Direct year match found with normalized model key: {norm_year_key}")
                return vehicle_data[norm_year_key]
        elif norm_key in vehicle_data:
            logger.info(f"Direct match found with normalized model key: {norm_key}")
            return vehicle_data[norm_key]
    
    # Try base model for better matching
    base_model = extract_base_model(model)
    if base_model != model:
        base_key = f"{make}_{base_model}".lower().replace(" ", "_")
        if year:
            base_year_key = f"{make}_{base_model}_{year}".lower().replace(" ", "_")
            if base_year_key in vehicle_data:
                logger.info(f"Direct year match found with base model key: {base_year_key}")
                return vehicle_data[base_year_key]
        elif base_key in vehicle_data:
            logger.info(f"Direct match found with base model key: {base_key}")
            return vehicle_data[base_key]
    
    # Try base key lookup (no year)
    if key in vehicle_data:
        # If year provided, verify this data is appropriate for that year
        if year:
            model_type = vehicle_data[key]["vehicleIdentification"].get("modelType", "")
            start_year, end_year = extract_year_info(model_type)
            
            logger.info(f"Checking year range for {key}: {start_year}-{end_year} against requested year {year}")
            
            if start_year and ((end_year is None and year >= start_year) or 
                              (end_year is not None and start_year <= year <= end_year)):
                logger.info(f"Year {year} is within range {start_year}-{end_year or 'present'}")
                return vehicle_data[key]
        else:
            # No year provided, use direct match
            logger.info(f"Direct match without year: {key}")
            return vehicle_data[key]
    
    # Try partial model matching
    if year:
        # Get potential matches with the correct year
        year_keys = [k for k in vehicle_data.keys() 
                     if make.lower() in k and f"_{year}" in k]
        
        for year_key in year_keys:
            # Extract model part from key
            key_parts = year_key.split('_')
            if len(key_parts) >= 3:  # Make sure we have enough parts
                # Get the model part (everything between make and year)
                key_model = '_'.join(key_parts[1:-1])
                
                # Check if our model is in this key model or vice versa
                if model.lower().replace(" ", "_") in key_model or key_model in model.lower().replace(" ", "_"):
                    logger.info(f"Partial model match with year: {year_key}")
                    return vehicle_data[year_key]
    
    # Try fuzzy matching as last resort
    logger.info(f"Attempting fuzzy matching for {make} {model} (year: {year})")
    match = find_vehicle_match(make, model, year, data_type="repair_times")
    if match:
        matched_data = vehicle_data[match["key"]]
        logger.info(f"Fuzzy match found: {match['make']} {match['model']} {match.get('startYear')}-{match.get('endYear')}")
        
        # Add matching information to response
        result = {
            "vehicleIdentification": {
                "make": make,
                "model": model,
                "matchedTo": {
                    "make": match["make"],
                    "model": match["model"],
                    "modelType": match["modelType"]
                }
            }
        }
        
        # Add year range if available
        if match.get("startYear"):
            result["vehicleIdentification"]["matchedTo"]["yearRange"] = {
                "startYear": match["startYear"],
                "endYear": match["endYear"] or "present"
            }
        
        # Add all other data from the matched vehicle
        for key, value in matched_data.items():
            if key != "vehicleIdentification":
                result[key] = value
                
        return result
    
    # No match found
    logger.warning(f"No repair time match found for {make} {model} (year: {year})")
    
    # For debugging - log available keys that might be relevant
    similar_keys = [k for k in vehicle_data.keys() if make.lower() in k and len(k) < 40]
    if similar_keys:
        logger.info(f"Similar repair time keys available: {similar_keys}")
    
    raise HTTPException(
        status_code=404, 
        detail=f"No repair time data found for {make} {model}" + 
              (f" (year: {year})" if year else "")
    )

@app.get("/api/v1/tech-specs/{make}/{model}")
@cached(cache=tech_specs_cache)
async def get_vehicle_tech_specs(
    make: str, 
    model: str, 
    response: Response,
    year: Optional[int] = None,
    fuel_type: Optional[str] = None,
):
    """
    Get technical specifications with general model matching logic.
    """
    if not tech_specs_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Technical specifications data not loaded")
        
    # Set headers
    response.headers["X-Cache"] = "HIT"
    response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
    response.headers["X-Data-Type"] = "tech_specs"
    
    # Log request
    logger.info(f"Looking up tech specs for: {make} {model} (year: {year}, fuel: {fuel_type})")
    
    # Normalize parameters
    make = make.strip()
    model = model.strip()
    
    # Extract base model using the general function
    base_model = extract_base_model(model)
    
    # Prepare normalized model variations for flexible matching
    normalized_model = normalize_model_name(model)
    
    # Try direct lookups with all data (most specific first)
    if year and fuel_type:
        # Full model, year, and fuel type
        fuel_year_key = f"{make}_{model}_{fuel_type}_{year}".lower().replace(" ", "_")
        if fuel_year_key in tech_specs_data:
            logger.info(f"Direct match with full model, year and fuel type: {fuel_year_key}")
            return tech_specs_data[fuel_year_key]
        
        # Base model, year, and fuel type
        if base_model != model:
            base_fuel_year_key = f"{make}_{base_model}_{fuel_type}_{year}".lower().replace(" ", "_")
            if base_fuel_year_key in tech_specs_data:
                logger.info(f"Direct match with base model, year and fuel type: {base_fuel_year_key}")
                return tech_specs_data[base_fuel_year_key]
        
        # Normalized model, year, and fuel type
        if normalized_model != model.lower().strip():
            norm_fuel_year_key = f"{make}_{normalized_model}_{fuel_type}_{year}".lower().replace(" ", "_")
            if norm_fuel_year_key in tech_specs_data:
                logger.info(f"Direct match with normalized model, year and fuel type: {norm_fuel_year_key}")
                return tech_specs_data[norm_fuel_year_key]
    
    # Try year only - prioritize year matching over fuel type
    if year:
        # Full model and year
        year_key = f"{make}_{model}_{year}".lower().replace(" ", "_")
        if year_key in tech_specs_data:
            logger.info(f"Direct match with full model and year: {year_key}")
            return tech_specs_data[year_key]
        
        # Base model and year
        if base_model != model:
            base_year_key = f"{make}_{base_model}_{year}".lower().replace(" ", "_")
            if base_year_key in tech_specs_data:
                logger.info(f"Direct match with base model and year: {base_year_key}")
                return tech_specs_data[base_year_key]
        
        # Normalized model and year
        if normalized_model != model.lower().strip():
            norm_year_key = f"{make}_{normalized_model}_{year}".lower().replace(" ", "_")
            if norm_year_key in tech_specs_data:
                logger.info(f"Direct match with normalized model and year: {norm_year_key}")
                return tech_specs_data[norm_year_key]
        
        # If we have year, try to match on year with a partial model match
        # Get all keys for this make and year
        make_year_keys = [k for k in tech_specs_data.keys() 
                      if make.lower() in k and f"_{year}" in k]
        
        # For each key, check if the model is contained within it or vice versa
        for key in make_year_keys:
            key_parts = key.split('_')
            if len(key_parts) >= 3:  # Ensure we have enough parts
                key_model_part = '_'.join(key_parts[1:-1])  # Model parts excluding year
                
                # If model is contained in key model or vice versa
                if (model.lower().replace(" ", "_") in key_model_part or 
                    key_model_part in model.lower().replace(" ", "_")):
                    logger.info(f"Found partial model match with year: {key}")
                    return tech_specs_data[key]
    
    # Try fuel type only
    if fuel_type:
        # Full model and fuel type
        fuel_key = f"{make}_{model}_{fuel_type}".lower().replace(" ", "_")
        if fuel_key in tech_specs_data:
            logger.info(f"Direct match with full model and fuel type: {fuel_key}")
            return tech_specs_data[fuel_key]
        
        # Base model and fuel type
        if base_model != model:
            base_fuel_key = f"{make}_{base_model}_{fuel_type}".lower().replace(" ", "_")
            if base_fuel_key in tech_specs_data:
                logger.info(f"Direct match with base model and fuel type: {base_fuel_key}")
                return tech_specs_data[base_fuel_key]
        
        # Normalized model and fuel type
        if normalized_model != model.lower().strip():
            norm_fuel_key = f"{make}_{normalized_model}_{fuel_type}".lower().replace(" ", "_")
            if norm_fuel_key in tech_specs_data:
                logger.info(f"Direct match with normalized model and fuel type: {norm_fuel_key}")
                return tech_specs_data[norm_fuel_key]
    
    # Try base keys
    
    # Full model
    key = f"{make}_{model}".lower().replace(" ", "_")
    if key in tech_specs_data:
        # Verify year compatibility if provided
        if year:
            model_type = tech_specs_data[key]["vehicleIdentification"].get("modelType", "")
            start_year, end_year = extract_year_info(model_type)
            
            if start_year and ((end_year is None and year >= start_year) or 
                              (end_year is not None and start_year <= year <= end_year)):
                logger.info(f"Year {year} is within range {start_year}-{end_year or 'present'} for full model")
                return tech_specs_data[key]
        else:
            # No year provided, use direct match
            logger.info(f"Direct match with full model: {key}")
            return tech_specs_data[key]
    
    # Base model
    if base_model != model:
        base_key = f"{make}_{base_model}".lower().replace(" ", "_")
        if base_key in tech_specs_data:
            # Verify year compatibility if provided
            if year:
                model_type = tech_specs_data[base_key]["vehicleIdentification"].get("modelType", "")
                start_year, end_year = extract_year_info(model_type)
                
                if start_year and ((end_year is None and year >= start_year) or 
                                (end_year is not None and start_year <= year <= end_year)):
                    logger.info(f"Year {year} is within range {start_year}-{end_year or 'present'} for base model")
                    return tech_specs_data[base_key]
            else:
                # No year provided, use direct match
                logger.info(f"Direct match with base model: {base_key}")
                return tech_specs_data[base_key]
    
    # Normalized model
    if normalized_model != model.lower().strip():
        norm_key = f"{make}_{normalized_model}".lower().replace(" ", "_")
        if norm_key in tech_specs_data:
            # Verify year compatibility if provided
            if year:
                model_type = tech_specs_data[norm_key]["vehicleIdentification"].get("modelType", "")
                start_year, end_year = extract_year_info(model_type)
                
                if start_year and ((end_year is None and year >= start_year) or 
                                (end_year is not None and start_year <= year <= end_year)):
                    logger.info(f"Year {year} is within range {start_year}-{end_year or 'present'} for normalized model")
                    return tech_specs_data[norm_key]
            else:
                # No year provided, use direct match
                logger.info(f"Direct match with normalized model: {norm_key}")
                return tech_specs_data[norm_key]
    
    # Try partial model matching in database keys
    # This handles cases where the frontend sends a subset of the actual model name
    make_models = [k for k in tech_specs_data.keys() if make.lower() in k]
    matching_keys = []
    
    for key in make_models:
        key_parts = key.split('_')
        if len(key_parts) >= 2:  # At least make and model
            key_model_part = key_parts[1]  # Just the main model part
            
            # Check if requested model is contained in this key's model
            if model.lower().replace(" ", "_") in key_model_part:
                matching_keys.append(key)
                
            # Also check if this key's model is contained in the requested model
            elif key_model_part in model.lower().replace(" ", "_"):
                matching_keys.append(key)
    
    if matching_keys and year:
        # Prioritize keys that match the year
        year_matching_keys = [k for k in matching_keys if f"_{year}" in k]
        if year_matching_keys:
            best_key = year_matching_keys[0]  # Take the first match
            logger.info(f"Found partial model match with year: {best_key}")
            return tech_specs_data[best_key]
    
    # Fuzzy matching as last resort
    logger.info(f"Attempting fuzzy matching for {make} {model} (year: {year}, fuel: {fuel_type})")
    match = find_vehicle_match(make, model, year, fuel_type, data_type="tech_specs")
    
    if match:
        matched_data = tech_specs_data[match["key"]]
        logger.info(f"Fuzzy match found: {match['make']} {match['model']} {match.get('fuelType', 'unknown')}")
        
        # Add matching info to response
        result = {
            "vehicleIdentification": {
                "make": make,
                "model": model,
                "matchedTo": {
                    "make": match["make"],
                    "model": match["model"],
                    "modelType": match["modelType"],
                    "fuelType": match.get("fuelType", "unknown")
                }
            }
        }
        
        # Add year range if available
        if match.get("startYear"):
            result["vehicleIdentification"]["matchedTo"]["yearRange"] = {
                "startYear": match["startYear"],
                "endYear": match["endYear"] or "present"
            }
        
        # Add all other data
        for key, value in matched_data.items():
            if key != "vehicleIdentification":
                result[key] = value
                
        return result
        
    # No match found
    logger.warning(f"No tech specs match found for {make} {model} (year: {year}, fuel: {fuel_type})")
    
    # For debugging
    similar_keys = [k for k in tech_specs_data.keys() 
                   if make.lower() in k and len(k) < 30]
    if similar_keys:
        logger.info(f"Similar tech spec keys available: {similar_keys}")
    
    raise HTTPException(
        status_code=404, 
        detail=f"No technical specifications found for {make} {model}" + 
              (f" (year: {year})" if year else "") +
              (f" (fuel type: {fuel_type})" if fuel_type else "")
    )

@app.get("/api/v1/vehicle-data/{make}/{model}")
async def get_combined_vehicle_data(
    make: str, 
    model: str, 
    response: Response,
    year: Optional[int] = None,
    fuel_type: Optional[str] = None,
):
    """
    Get combined data (both repair times and technical specifications) for a specific vehicle.
    """
    if not vehicle_index:
        raise HTTPException(status_code=500, detail="Vehicle index not built")
    
    result = {
        "vehicleIdentification": {
            "make": make,
            "model": model
        }
    }
    
    # Add fuel type if provided
    if fuel_type:
        result["vehicleIdentification"]["fuelType"] = fuel_type
    
    # Add year if provided
    if year:
        result["vehicleIdentification"]["year"] = year
    
    # Try to get repair times
    try:
        repair_times = await get_vehicle_repair_times(make, model, response, year)
        result["repairTimes"] = repair_times
        result["hasRepairTimes"] = True
    except HTTPException:
        result["hasRepairTimes"] = False
    
    # Try to get technical specifications
    try:
        tech_specs = await get_vehicle_tech_specs(make, model, response, year, fuel_type)
        # Add each technical section to the result
        for key, value in tech_specs.items():
            if key != "vehicleIdentification":
                result[key] = value
        result["hasTechSpecs"] = True
    except HTTPException:
        result["hasTechSpecs"] = False
    
    # Return 404 if neither data type was found
    if not result.get("hasRepairTimes") and not result.get("hasTechSpecs"):
        raise HTTPException(
            status_code=404,
            detail=f"No data found for {make} {model}" + 
                  (f" (year: {year})" if year else "") +
                  (f" (fuel type: {fuel_type})" if fuel_type else "")
        )
    
    return result

@app.post("/api/v1/repair-times-lookup")
async def lookup_repair_times(request: VehicleDataRequest, response: Response):
    """
    Match repair times data based on vehicle data from another source
    """
    if not vehicle_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Vehicle data not loaded")
    
    vehicle_data_dict = request.vehicleData
    
    # Extract basic info from vehicle data
    make = vehicle_data_dict.get("make", "")
    model = vehicle_data_dict.get("model", "") or vehicle_data_dict.get("vehicleModel", "")
    
    # Get year either from direct year property or by extracting from date fields
    year = vehicle_data_dict.get("year")
    
    if not year:
        # Try common date fields
        for field in ["yearOfManufacture", "manufactureYear", "registrationDate"]:
            if field in vehicle_data_dict and vehicle_data_dict[field]:
                date_value = str(vehicle_data_dict[field])
                year_match = re.search(r'(\d{4})', date_value)
                if year_match:
                    year = int(year_match.group(1))
                    break
    
    if not make or not model:
        raise HTTPException(status_code=400, detail="Vehicle make and model required")
    
    logger.info(f"Looking up repair times for {make} {model} (year: {year})")
    
    # Create cache key
    cache_key = f"vehicle_{make}_{model}"
    if year:
        cache_key += f"_{year}"
    cache_key = cache_key.lower().replace(" ", "_")
    
    # Check cache using the same logic as the get_vehicle_repair_times function
    if cache_key in vehicle_cache:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        return vehicle_cache[cache_key]
    
    response.headers["X-Cache"] = "MISS"
    
    # Reuse the same lookup logic
    result = await get_vehicle_repair_times(make, model, response, year)
    
    # Cache result
    vehicle_cache[cache_key] = result
    return result

@app.post("/api/v1/tech-specs-lookup")
async def lookup_tech_specs(request: TechSpecsRequest, response: Response):
    """
    Match technical specifications with fuel type support
    """
    if not tech_specs_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Technical specifications data not loaded")
    
    vehicle_data_dict = request.vehicleData
    
    # Extract all vehicle information
    make = vehicle_data_dict.get("make", "")
    model = vehicle_data_dict.get("model", "") or vehicle_data_dict.get("vehicleModel", "")
    fuel_type = vehicle_data_dict.get("fuelType")
    
    # Normalize fuel type
    if fuel_type:
        fuel_type = fuel_type.lower().strip()
        # Map common fuel type variations
        if fuel_type in ["gasoline", "unleaded", "gas"]:
            fuel_type = "petrol"
        elif fuel_type in ["gasoil", "derv"]:
            fuel_type = "diesel"
    
    # Get year from various possible fields
    year = vehicle_data_dict.get("year")
    if not year:
        for field in ["yearOfManufacture", "manufactureYear", "registrationDate"]:
            if field in vehicle_data_dict and vehicle_data_dict[field]:
                date_value = str(vehicle_data_dict[field])
                year_match = re.search(r'(\d{4})', date_value)
                if year_match:
                    year = int(year_match.group(1))
                    break
    
    if not make or not model:
        raise HTTPException(status_code=400, detail="Vehicle make and model required")
    
    logger.info(f"Looking up tech specs for {make} {model} (year: {year}, fuel: {fuel_type})")
    
    # Create cache key with fuel type
    cache_key = f"tech_specs_{make}_{model}"
    if year:
        cache_key += f"_{year}"
    if fuel_type:
        cache_key += f"_{fuel_type}"
    cache_key = cache_key.lower().replace(" ", "_")
    
    # Check cache
    if cache_key in tech_specs_cache:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        return tech_specs_cache[cache_key]
    
    response.headers["X-Cache"] = "MISS"
    
    # Use enhanced lookup with fuel type
    result = await get_vehicle_tech_specs(make, model, response, year, fuel_type)
    
    # Cache result
    tech_specs_cache[cache_key] = result
    return result

@app.post("/api/v1/cache/clear")
async def clear_cache():
    """Clear all data caches"""
    vehicle_cache.clear()
    tech_specs_cache.clear()
    logger.info("All caches cleared manually")
    return {"status": "success", "message": "All caches cleared successfully"}

@app.on_event("startup")
async def startup_event():
    """Load data and build indexes on startup"""
    global vehicle_data, tech_specs_data, vehicle_index
    
    try:
        # Load both data types
        vehicle_data, tech_specs_data = load_all_vehicle_data()
        
        # Build unified index
        vehicle_index = build_vehicle_index()
        
        logger.info(f"API started successfully with {len(vehicle_data)} repair time records and {len(tech_specs_data)} technical specification records")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Fix asyncio event loop policy for Windows if needed
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    # Start the server
    uvicorn.run(
        app,
        host=Config.HOST,
        port=Config.PORT,
        log_level="info"
    )