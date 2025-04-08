"""
Technical Bulletins API - Provides known fixes and technical bulletins for vehicles
A FastAPI service providing access to vehicle-specific technical bulletins and known fixes
with enhanced vehicle data matching
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
from pydantic import BaseModel, Field, validator
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
        logging.FileHandler("bulletins_api.log")
    ]
)
logger = logging.getLogger("bulletins_api")

# Constants and configuration
class Config:
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8006"))  # Different from vehicle API port
    
    # Data directory settings
    BULLETINS_DATA_DIR = os.getenv("BULLETINS_DATA_DIR", "fix_details_json")
    
    # Security settings
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174").split(",")
    
    # Caching settings
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour by default
    CACHE_MAXSIZE = int(os.getenv("CACHE_MAXSIZE", "1000"))
    
    # Rate limiting settings
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "1"))  # 5 requests per second
    
    # Matching settings
    MIN_MATCH_SCORE = float(os.getenv("MIN_MATCH_SCORE", "0.6"))  # Minimum similarity score

# Models - Enhanced with additional fields for better vehicle matching
class VehicleRequest(BaseModel):
    make: str
    model: str
    year: Optional[int] = None
    engine_code: Optional[str] = None
    vehicle_id: Optional[str] = None
    # New fields that might be available in vehicleData
    engineCapacity: Optional[int] = None
    fuelType: Optional[str] = None
    variant: Optional[str] = None
    vehicleModel: Optional[str] = None  # Alternative model field name
    registration: Optional[str] = None
    registration_number: Optional[str] = None
    yearOfManufacture: Optional[Union[int, str]] = None
    manufactureDate: Optional[str] = None
    firstRegisteredDate: Optional[str] = None
    firstRegistrationDate: Optional[str] = None
    # Category and bulletin filters
    category: Optional[str] = None
    bulletin_id: Optional[str] = None
    
    # Validator to ensure we have at least make and model
    @validator('make', 'model', pre=True)
    def ensure_required_fields(cls, v):
        if not v:
            raise ValueError("Make and model are required")
        return v

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    cacheSize: int
    availableVehicles: int

# Initialize caches
bulletins_cache = TTLCache(maxsize=Config.CACHE_MAXSIZE, ttl=Config.CACHE_TTL)

# Storage for bulletin data and indexes
bulletin_data = {}  # Stores all bulletin data
vehicle_index = {}  # Index for quick vehicle lookup

# FastAPI application
app = FastAPI(
    title="Vehicle Bulletins API",
    description="API service providing technical bulletins and known fixes for vehicles",
    version="1.1.0"
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Cache", "Cache-Control", "Content-Type"],
    max_age=86400,  # Cache preflight requests for 24 hours
)
app.add_middleware(GZipMiddleware, minimum_size=500)

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

        # Only rate limit the bulletin endpoints
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

app.add_middleware(RateLimiterMiddleware)

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

# Helper Functions
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

def extract_vehicle_id_from_filename(filename):
    """Extract vehicle ID from a filename"""
    # Look for patterns like HON12345, BMW54321, etc.
    match = re.search(r'([A-Z]{3}\d+)', filename)
    if match:
        return match.group(1)
    return None

def extract_year_from_vehicleData(vehicle_data):
    """
    Extract year from various fields in vehicle data
    """
    if not vehicle_data:
        return None
        
    # Direct year field
    if hasattr(vehicle_data, 'year') and vehicle_data.year:
        return vehicle_data.year
        
    # Year of manufacture field
    if hasattr(vehicle_data, 'yearOfManufacture'):
        if isinstance(vehicle_data.yearOfManufacture, int):
            return vehicle_data.yearOfManufacture
        elif isinstance(vehicle_data.yearOfManufacture, str):
            year_match = re.search(r'(\d{4})', vehicle_data.yearOfManufacture)
            if year_match:
                return int(year_match.group(1))
    
    # Manufacture date field
    if hasattr(vehicle_data, 'manufactureDate') and vehicle_data.manufactureDate:
        year_match = re.search(r'(\d{4})', str(vehicle_data.manufactureDate))
        if year_match:
            return int(year_match.group(1))
    
    # Registration date fields
    for field in ['registrationDate', 'firstRegisteredDate', 'firstRegistrationDate']:
        if hasattr(vehicle_data, field) and getattr(vehicle_data, field):
            year_match = re.search(r'(\d{4})', str(getattr(vehicle_data, field)))
            if year_match:
                return int(year_match.group(1))
    
    return None

def extract_engine_code(vehicle_data):
    """
    Extract or derive engine code from various fields in vehicle data
    """
    if not vehicle_data:
        return None
    
    # Direct engine code field
    if hasattr(vehicle_data, 'engine_code') and vehicle_data.engine_code:
        return vehicle_data.engine_code
    
    if hasattr(vehicle_data, 'engineCode') and vehicle_data.engineCode:
        return vehicle_data.engineCode
    
    # Try to derive from engine capacity
    if hasattr(vehicle_data, 'engineCapacity') and vehicle_data.engineCapacity:
        capacity = vehicle_data.engineCapacity
        if isinstance(capacity, (int, float)) and capacity > 0:
            # Convert to typical format (e.g., 1998cc -> "2.0")
            if capacity > 1000:
                return f"{capacity / 1000:.1f}"
            else:
                return str(capacity)
    
    return None

def load_bulletin_data():
    """Load all bulletin JSON files and build an index"""
    global bulletin_data, vehicle_index
    
    # Reset data stores
    bulletin_data = {}
    vehicle_index = {}
    
    # Ensure the directory exists
    os.makedirs(Config.BULLETINS_DATA_DIR, exist_ok=True)
    
    # Get all JSON files in the bulletins directory
    json_files = [f for f in os.listdir(Config.BULLETINS_DATA_DIR) if f.endswith('.json')]
    logger.info(f"Found {len(json_files)} bulletin JSON files")
    
    for json_file in json_files:
        try:
            file_path = os.path.join(Config.BULLETINS_DATA_DIR, json_file)
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract vehicle information
            vehicle_id = data.get("vehicle_id")
            
            # If there's no vehicle_id, try to extract from filename
            if not vehicle_id:
                vehicle_id = extract_vehicle_id_from_filename(json_file)
            
            if not vehicle_id:
                logger.warning(f"Skipping {json_file}: could not determine vehicle ID")
                continue
            
            # Get metadata from the file
            metadata = data.get("metadata", {})
            vehicle_info = data.get("vehicle_info", {})
            
            make = metadata.get("make") or vehicle_info.get("manufacturer")
            model = metadata.get("model") or vehicle_info.get("model")
            engine_info = metadata.get("engine_info", "")
            
            if not make or not model:
                logger.warning(f"Skipping {json_file}: missing make or model information")
                continue
            
            # Store in bulletins data
            bulletin_data[vehicle_id] = data
            
            # Extract base model
            base_model = extract_base_model(model)
            
            # Get normalized model
            normalized_model = normalize_model_name(model)
            
            # Build index entry
            index_entry = {
                "vehicle_id": vehicle_id,
                "make": make,
                "model": model,
                "base_model": base_model,
                "normalized_model": normalized_model,
                "engine_info": engine_info,
                "json_file": json_file,
                "bulletin_count": len(data.get("bulletins", [])),
                "categories": list(data.get("categories", {}).keys()) if data.get("categories") else []
            }
            
            # Add to index by vehicle ID for direct lookup
            vehicle_index[vehicle_id] = index_entry
            
            # Add to index by make_model keys for flexible lookup
            # Basic key: make_model
            make_model_key = f"{make}_{model}".lower().replace(" ", "_")
            vehicle_index[make_model_key] = index_entry
            
            # Base model key
            if base_model != model:
                base_key = f"{make}_{base_model}".lower().replace(" ", "_")
                vehicle_index[base_key] = index_entry
            
            # Normalized model key
            if normalized_model != model.lower().strip():
                norm_key = f"{make}_{normalized_model}".lower().replace(" ", "_")
                vehicle_index[norm_key] = index_entry
            
            logger.info(f"Loaded bulletins for {make} {model} ({vehicle_id}) - {len(data.get('bulletins', []))} bulletins")
            
        except Exception as e:
            logger.error(f"Error loading bulletin file {json_file}: {str(e)}")
    
    logger.info(f"Loaded {len(bulletin_data)} vehicle bulletin sets with {len(vehicle_index)} index entries")
    return bulletin_data, vehicle_index

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
    
    # Debug logging
    logger.debug(f"Model match details for '{requested_model}' vs '{db_model}':")
    logger.debug(f"  - Exact: {exact_match_score:.2f} | Base: {base_model_match_score:.2f}")
    logger.debug(f"  - Contains: {contains_match_score:.2f} | RevContains: {reverse_contains_score:.2f}")
    logger.debug(f"  - Cleaned: {cleaned_match_score:.2f} | Token: {token_match_score:.2f}")
    logger.debug(f"  - Levenshtein: {levenshtein_score:.2f}")
    logger.debug(f"  - FINAL SCORE: {model_score:.2f}")
    
    return model_score

def find_vehicle_match(make: str, model: str, engine_code: Optional[str] = None, year: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """
    Find the best matching vehicle for the given make and model
    Now includes year and engine code in matching and adds _matchConfidence field
    """
    if not vehicle_index:
        logger.error("Vehicle index not built")
        return None
    
    normalized_make = make.lower().strip()
    normalized_model = model.lower().strip()
    
    # Try exact make_model match first
    key = f"{normalized_make}_{normalized_model}".replace(" ", "_")
    if key in vehicle_index:
        match = vehicle_index[key]
        match["_matchConfidence"] = "exact"
        logger.info(f"Exact match found for {make} {model}")
        return match
    
    # Try base model
    base_model = extract_base_model(normalized_model)
    if base_model != normalized_model:
        base_key = f"{normalized_make}_{base_model}".replace(" ", "_")
        if base_key in vehicle_index:
            match = vehicle_index[base_key]
            match["_matchConfidence"] = "high"
            logger.info(f"Base model match found for {make} {model} -> {make} {base_model}")
            return match
    
    # Try normalized model
    normalized = normalize_model_name(normalized_model)
    if normalized != normalized_model:
        norm_key = f"{normalized_make}_{normalized}".replace(" ", "_")
        if norm_key in vehicle_index:
            match = vehicle_index[norm_key]
            match["_matchConfidence"] = "high"
            logger.info(f"Normalized model match found for {make} {model} -> {make} {normalized}")
            return match
    
    # Store candidates with scores for fuzzy matching
    candidates = []
    
    # Find all vehicles with matching make
    make_matches = [v for k, v in vehicle_index.items() 
                  if isinstance(v, dict) and v.get("make", "").lower() == normalized_make]
    
    if make_matches:
        logger.info(f"Found {len(make_matches)} vehicles matching make '{normalized_make}'")
        
        for vehicle in make_matches:
            db_model = vehicle["model"].lower().strip()
            db_base_model = vehicle.get("base_model", "").lower().strip()
            
            # Calculate model match score
            model_score = calculate_model_match_score(normalized_model, db_model, db_base_model)
            
            # Engine code scoring - prioritize matches with similar engine code
            engine_score = 0.0
            if engine_code and vehicle.get("engine_info"):
                engine_info = vehicle.get("engine_info", "").lower()
                if engine_code.lower() in engine_info:
                    # Engine code is contained in engine info
                    engine_score = 0.9
                elif any(code in engine_code.lower() for code in engine_info.split()):
                    # Partial match
                    engine_score = 0.7
            
            # Calculate final score, weighting model match more heavily
            final_score = model_score * 0.8
            if engine_score > 0:
                final_score += engine_score * 0.2
            
            # Add to candidates if score is reasonable
            if model_score > 0.4 or (engine_score > 0.7):
                candidates.append({
                    "vehicle": vehicle,
                    "score": final_score
                })
    
    # If no matches by exact make, try fuzzy make matching
    if not candidates:
        logger.info(f"No candidates with exact make match, trying fuzzy make matching")
        
        for key, vehicle in vehicle_index.items():
            if not isinstance(vehicle, dict) or "make" not in vehicle:
                continue
                
            # Calculate make similarity
            make_score = SequenceMatcher(None, normalized_make, vehicle["make"].lower()).ratio()
            
            # Skip poor make matches for efficiency
            if make_score < 0.7:
                continue
                
            db_model = vehicle["model"].lower().strip()
            db_base_model = vehicle.get("base_model", "").lower().strip()
            
            # Calculate model match score
            model_score = calculate_model_match_score(normalized_model, db_model, db_base_model)
            
            # Engine code scoring
            engine_score = 0.0
            if engine_code and vehicle.get("engine_info"):
                engine_info = vehicle.get("engine_info", "").lower()
                if engine_code.lower() in engine_info:
                    # Engine code is contained in engine info
                    engine_score = 0.9
                elif any(code in engine_code.lower() for code in engine_info.split()):
                    # Partial match
                    engine_score = 0.7
            
            # Calculate combined score
            combined_score = (model_score * 0.6) + (make_score * 0.3)
            if engine_score > 0:
                combined_score += engine_score * 0.1
            
            # Add to candidates if reasonable match
            if combined_score > 0.6:
                candidates.append({
                    "vehicle": vehicle,
                    "score": combined_score
                })
    
    # Sort candidates by score
    candidates.sort(key=lambda x: x["score"], reverse=True)
    
    # Log top candidates
    if candidates:
        logger.info(f"Top {min(3, len(candidates))} matching candidates:")
        for i, candidate in enumerate(candidates[:3]):
            v = candidate["vehicle"]
            logger.info(
                f"#{i+1}: {v['make']} {v['model']} - "
                f"Score: {candidate['score']:.2f}"
            )
    
    # Return best match if it meets threshold
    if candidates and candidates[0]["score"] >= Config.MIN_MATCH_SCORE:
        best_match = candidates[0]["vehicle"]
        
        # Add match confidence based on score
        score = candidates[0]["score"]
        if score > 0.9:
            best_match["_matchConfidence"] = "exact"
        elif score > 0.7:
            best_match["_matchConfidence"] = "high"
        else:
            best_match["_matchConfidence"] = "fuzzy"
            
        logger.info(
            f"Selected match: {best_match['make']} {best_match['model']} "
            f"with score: {score:.2f}, confidence: {best_match['_matchConfidence']}"
        )
        return best_match
    
    logger.info(f"No good match found for {make} {model}")
    return None

# API Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.1.0",
        "cacheSize": len(bulletins_cache),
        "availableVehicles": len(bulletin_data)
    }

@app.get("/api/v1/bulletins")
async def get_available_bulletins(make: Optional[str] = None):
    """
    Get list of all vehicles with available bulletins
    Optional filtering by make
    """
    if not vehicle_index:
        raise HTTPException(status_code=500, detail="Vehicle index not built")
    
    vehicles = []
    for key, vehicle in vehicle_index.items():
        # Only include actual vehicle entries, not lookup keys
        if isinstance(vehicle, dict) and "vehicle_id" in vehicle and "make" in vehicle:
            # Apply make filter if provided
            if make and vehicle["make"].lower() != make.lower():
                continue
                
            # Check if this vehicle_id is already in the list
            if not any(v["vehicle_id"] == vehicle["vehicle_id"] for v in vehicles):
                # Get categories from the actual data
                categories = {}
                if vehicle["vehicle_id"] in bulletin_data:
                    categories = bulletin_data[vehicle["vehicle_id"]].get("categories", {})
                
                vehicles.append({
                    "vehicle_id": vehicle["vehicle_id"],
                    "make": vehicle["make"],
                    "model": vehicle["model"],
                    "engine_info": vehicle.get("engine_info", ""),
                    "bulletin_count": vehicle.get("bulletin_count", 0),
                    "categories": list(categories.keys())
                })
    
    return {"vehicles": vehicles, "count": len(vehicles)}

@app.get("/api/v1/bulletins/{vehicle_id}")
@cached(cache=bulletins_cache)
async def get_bulletins_by_id(vehicle_id: str, response: Response):
    """Get bulletins for a specific vehicle by ID"""
    if not bulletin_data:
        raise HTTPException(status_code=500, detail="Bulletin data not loaded")
    
    # Set cache headers
    response.headers["X-Cache"] = "HIT"
    response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
    
    if vehicle_id in bulletin_data:
        return bulletin_data[vehicle_id]
    
    raise HTTPException(
        status_code=404,
        detail=f"No bulletins found for vehicle ID: {vehicle_id}"
    )

@app.get("/api/v1/bulletins/lookup/{make}/{model}")
async def lookup_bulletins(
    make: str, 
    model: str, 
    response: Response,
    category: Optional[str] = None,
    bulletin_id: Optional[str] = None
):
    """
    Lookup bulletins by make and model with flexible matching
    Optional filters for category and specific bulletin ID
    """
    if not bulletin_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Bulletin data not loaded")
    
    logger.info(f"Looking up bulletins for {make} {model}, Category: {category}, Bulletin ID: {bulletin_id}")
    
    # Create cache key
    cache_key = f"bulletins_{make}_{model}"
    if category:
        cache_key += f"_{category}"
    if bulletin_id:
        cache_key += f"_{bulletin_id}"
    cache_key = cache_key.lower().replace(" ", "_")
    
    # Check cache
    if cache_key in bulletins_cache:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        return bulletins_cache[cache_key]
    
    response.headers["X-Cache"] = "MISS"
    
    # Try direct lookups first
    key = f"{make}_{model}".lower().replace(" ", "_")
    if key in vehicle_index:
        vehicle = vehicle_index[key]
        vehicle_id = vehicle["vehicle_id"]
        if vehicle_id in bulletin_data:
            result = bulletin_data[vehicle_id].copy()
            
            # Filter by category if requested
            if category and category in result.get("categories", {}):
                filtered_result = result.copy()
                filtered_result["categories"] = {category: result["categories"][category]}
                
                # Filter bulletins by matching category items
                category_bulletin_ids = set(item["id"] for item in result["categories"][category])
                filtered_result["bulletins"] = [
                    b for b in result["bulletins"] if bulletin_id == b.get("id") or 
                    any(bid == b.get("id") for bid in category_bulletin_ids)
                ]
                result = filtered_result
            
            # Filter by specific bulletin ID if requested
            elif bulletin_id:
                filtered_result = result.copy()
                filtered_result["bulletins"] = [b for b in result["bulletins"] if b.get("id") == bulletin_id]
                
                # Keep only relevant categories that contain this bulletin
                relevant_categories = {}
                for cat_name, items in result.get("categories", {}).items():
                    matching_items = [item for item in items if item.get("id") == bulletin_id]
                    if matching_items:
                        relevant_categories[cat_name] = matching_items
                
                filtered_result["categories"] = relevant_categories
                result = filtered_result
            
            # Cache the result
            bulletins_cache[cache_key] = result
            return result
    
    # Try fuzzy matching
    match = find_vehicle_match(make, model)
    if match:
        vehicle_id = match["vehicle_id"]
        if vehicle_id in bulletin_data:
            # Add match information to the response
            result = bulletin_data[vehicle_id].copy()
            
            # Add matched_to information
            if "metadata" not in result:
                result["metadata"] = {}
            
            result["metadata"]["matched_to"] = {
                "make": match["make"],
                "model": match["model"],
                "vehicle_id": vehicle_id,
                "match_confidence": match.get("_matchConfidence", "fuzzy")
            }
            
            # Apply category filtering if requested
            if category and category in result.get("categories", {}):
                filtered_result = result.copy()
                filtered_result["categories"] = {category: result["categories"][category]}
                
                # Filter bulletins by matching category items
                category_bulletin_ids = set(item["id"] for item in result["categories"][category])
                filtered_result["bulletins"] = [
                    b for b in result["bulletins"] if bulletin_id == b.get("id") or 
                    any(bid == b.get("id") for bid in category_bulletin_ids)
                ]
                result = filtered_result
            
            # Filter by specific bulletin ID if requested
            elif bulletin_id:
                filtered_result = result.copy()
                filtered_result["bulletins"] = [b for b in result["bulletins"] if b.get("id") == bulletin_id]
                
                # Keep only relevant categories that contain this bulletin
                relevant_categories = {}
                for cat_name, items in result.get("categories", {}).items():
                    matching_items = [item for item in items if item.get("id") == bulletin_id]
                    if matching_items:
                        relevant_categories[cat_name] = matching_items
                
                filtered_result["categories"] = relevant_categories
                result = filtered_result
            
            # Cache the result
            bulletins_cache[cache_key] = result
            return result
    
    # No match found
    category_msg = f" in category '{category}'" if category else ""
    bulletin_msg = f" with ID '{bulletin_id}'" if bulletin_id else ""
    raise HTTPException(
        status_code=404,
        detail=f"No bulletins found for {make} {model}{category_msg}{bulletin_msg}"
    )

@app.post("/api/v1/bulletins/lookup")
async def lookup_bulletins_post(request: VehicleRequest, response: Response):
    """
    Enhanced lookup with complete vehicle data support.
    Lookup bulletins by vehicle information provided in POST request
    """
    if not bulletin_data or not vehicle_index:
        raise HTTPException(status_code=500, detail="Bulletin data not loaded")
    
    # Extract basic information
    make = request.make
    model = request.model or request.vehicleModel
    vehicle_id = request.vehicle_id
    
    # Extract engine code from request
    engine_code = extract_engine_code(request)
    
    # Extract year from request 
    year = extract_year_from_vehicleData(request)
    
    # Get category and bulletin ID filters if provided
    category = request.category
    bulletin_id = request.bulletin_id
    
    logger.info(f"Enhanced POST lookup for bulletins - Make: {make}, Model: {model}, ID: {vehicle_id}, Engine: {engine_code}, Year: {year}")
    
    # If vehicle_id is provided, try direct lookup
    if vehicle_id and vehicle_id in bulletin_data:
        logger.info(f"Direct match by vehicle_id: {vehicle_id}")
        result = bulletin_data[vehicle_id].copy()
        
        # Add match confidence info
        if "metadata" not in result:
            result["metadata"] = {}
        result["metadata"]["match_confidence"] = "exact"
        
        # Filter by category or bulletin ID if requested
        if category or bulletin_id:
            return await filter_bulletin_results(result, category, bulletin_id)
        
        return result
    
    # Create cache key
    cache_key = f"bulletins_{make}_{model}"
    if engine_code:
        cache_key += f"_{engine_code}"
    if year:
        cache_key += f"_{year}"
    if request.fuelType:
        cache_key += f"_{request.fuelType}"
    if category:
        cache_key += f"_cat_{category}"
    if bulletin_id:
        cache_key += f"_b_{bulletin_id}"
    cache_key = cache_key.lower().replace(" ", "_")
    
    # Check cache
    if cache_key in bulletins_cache:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        return bulletins_cache[cache_key]
    
    response.headers["X-Cache"] = "MISS"
    
    # Try direct lookups first with engine code for better matching
    if make and model and engine_code:
        # Look through vehicle index for a match with this engine code
        for key, vehicle in vehicle_index.items():
            if (isinstance(vehicle, dict) and 
                vehicle.get("make", "").lower() == make.lower() and 
                vehicle.get("model", "").lower() == model.lower() and 
                engine_code.upper() in vehicle.get("engine_info", "").upper()):
                
                vehicle_id = vehicle["vehicle_id"]
                if vehicle_id in bulletin_data:
                    logger.info(f"Found match with engine code: {engine_code}")
                    result = bulletin_data[vehicle_id].copy()
                    
                    # Add match confidence info
                    if "metadata" not in result:
                        result["metadata"] = {}
                    result["metadata"]["match_confidence"] = "high"
                    
                    # Filter results if needed
                    if category or bulletin_id:
                        result = await filter_bulletin_results(result, category, bulletin_id)
                    
                    bulletins_cache[cache_key] = result
                    return result
    
    # Try fuzzy matching with enhanced vehicle information
    match = find_vehicle_match(make, model, engine_code, year)
    if match:
        vehicle_id = match["vehicle_id"]
        if vehicle_id in bulletin_data:
            # Add matching information to the response
            result = bulletin_data[vehicle_id].copy()
            
            # Add matched_to information
            if "metadata" not in result:
                result["metadata"] = {}
            
            match_confidence = match.get("_matchConfidence", "fuzzy")
            
            result["metadata"]["matched_to"] = {
                "make": match["make"],
                "model": match["model"],
                "vehicle_id": vehicle_id,
                "match_confidence": match_confidence
            }
            
            # Add requested info for reference
            if year:
                result["metadata"]["requested_year"] = year
            
            if engine_code:
                result["metadata"]["requested_engine"] = engine_code
            
            # Filter by category or bulletin ID if requested
            if category or bulletin_id:
                result = await filter_bulletin_results(result, category, bulletin_id)
            
            # Cache the result
            bulletins_cache[cache_key] = result
            return result
    
    # No match found
    engine_msg = f" (Engine: {engine_code})" if engine_code else ""
    year_msg = f" (Year: {year})" if year else ""
    category_msg = f" in category '{category}'" if category else ""
    bulletin_msg = f" with ID '{bulletin_id}'" if bulletin_id else ""
    
    raise HTTPException(
        status_code=404,
        detail=f"No bulletins found for {make} {model}{year_msg}{engine_msg}{category_msg}{bulletin_msg}"
    )

async def filter_bulletin_results(result, category=None, bulletin_id=None):
    """Helper function to filter bulletins by category or bulletin ID"""
    if category and category in result.get("categories", {}):
        filtered_result = result.copy()
        filtered_result["categories"] = {category: result["categories"][category]}
        
        # Filter bulletins by matching category items
        category_bulletin_ids = set()
        for item in result["categories"][category]:
            if isinstance(item, dict) and "id" in item:
                category_bulletin_ids.add(item["id"])
        
        filtered_result["bulletins"] = [
            b for b in result["bulletins"] if 
            (bulletin_id and b.get("id") == bulletin_id) or 
            (not bulletin_id and any(b.get("id") == bid for bid in category_bulletin_ids))
        ]
        return filtered_result
    
    # Filter by specific bulletin ID if requested
    elif bulletin_id:
        filtered_result = result.copy()
        filtered_result["bulletins"] = [b for b in result["bulletins"] if b.get("id") == bulletin_id]
        
        # Keep only relevant categories that contain this bulletin
        relevant_categories = {}
        for cat_name, items in result.get("categories", {}).items():
            matching_items = [item for item in items if isinstance(item, dict) and item.get("id") == bulletin_id]
            if matching_items:
                relevant_categories[cat_name] = matching_items
        
        filtered_result["categories"] = relevant_categories
        return filtered_result
    
    return result

@app.post("/api/v1/cache/clear")
async def clear_cache():
    """Clear all data caches"""
    bulletins_cache.clear()
    logger.info("Bulletin cache cleared manually")
    return {"status": "success", "message": "Cache cleared successfully"}

@app.on_event("startup")
async def startup_event():
    """Load data and build indexes on startup"""
    global bulletin_data, vehicle_index
    
    try:
        # Load bulletin data
        bulletin_data, vehicle_index = load_bulletin_data()
        
        logger.info(f"API started successfully with {len(bulletin_data)} bulletin records")
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