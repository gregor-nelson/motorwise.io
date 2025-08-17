"""
Vehicle Analysis Middleware
FastAPI service that combines MOT history and TSB data with Claude AI analysis
With enhanced persistent caching capabilities
"""
import os
import time
import json
import logging
import httpx
import fcntl
import tempfile
from functools import lru_cache
from typing import Optional, Dict, Any, List
from datetime import datetime
import pathlib

from fastapi import FastAPI, HTTPException, Depends, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("vehicle_analysis.log")
    ]
)
logger = logging.getLogger("vehicle_analysis_api")

# Validate required environment variables
required_env_vars = [
    "CLAUDE_API_KEY",
    "MOT_API_URL",
    "BULLETINS_API_URL"
]

missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Validate Claude API key format
def validate_claude_api_key(api_key: str) -> bool:
    """Validate Claude API key format"""
    if not api_key:
        return False
    # Claude API keys start with 'sk-ant-' and have a specific format
    if not api_key.startswith('sk-ant-'):
        return False
    # Should be at least 50 characters long
    if len(api_key) < 50:
        return False
    return True

claude_api_key = os.getenv("CLAUDE_API_KEY")
if not validate_claude_api_key(claude_api_key):
    logger.error("Invalid Claude API key format")
    raise EnvironmentError("Invalid Claude API key format")

# Constants and configuration
class Config:
    # Claude API settings
    CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
    CLAUDE_API_URL = os.getenv("CLAUDE_API_URL", "https://api.anthropic.com/v1/messages")
    CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-7-sonnet-20250219")
    ANTHROPIC_VERSION = "2023-06-01"
    
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8007"))  # Different from other API ports
    
    # Internal API URLs
    MOT_API_URL = os.getenv("MOT_API_URL")
    BULLETINS_API_URL = os.getenv("BULLETINS_API_URL")
    
    # Security settings
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",")
    
    # Caching settings
    CACHE_TTL = int(os.getenv("CACHE_TTL", "86400"))  # 24 hours by default
    CACHE_MAXSIZE = int(os.getenv("CACHE_MAXSIZE", "1000"))
    
    # NEW: File-based cache settings
    CACHE_DIR = os.getenv("CACHE_DIR", "./cache/analysis")
    USE_FILE_CACHE = os.getenv("USE_FILE_CACHE", "true").lower() == "true"
    
    # Rate limiting settings
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "60"))  # 5 requests per minute
    
    # Timeout settings
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", "30"))
    CLAUDE_TIMEOUT_SECONDS = int(os.getenv("CLAUDE_TIMEOUT_SECONDS", "45"))
    
    # Request size limits
    MAX_PROMPT_SIZE = int(os.getenv("MAX_PROMPT_SIZE", "100000"))  # 100KB max prompt
    MAX_RESPONSE_SIZE = int(os.getenv("MAX_RESPONSE_SIZE", "200000"))  # 200KB max response

# Pydantic models for API requests and responses
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    cache_size: int
    file_cache_entries: Optional[int] = None

class AnalysisResponse(BaseModel):
    registration: str
    analysis: str
    make: Optional[str] = None
    model: Optional[str] = None
    timestamp: int
    cached: bool = False

# In-memory cache for analysis results with size management
analysis_cache = {}
MEMORY_CACHE_MAX_SIZE = 100  # Maximum number of entries in memory cache

def cleanup_memory_cache():
    """Remove oldest entries when cache gets too large"""
    if len(analysis_cache) <= MEMORY_CACHE_MAX_SIZE:
        return
    
    # Sort by timestamp and remove oldest entries
    sorted_items = sorted(
        analysis_cache.items(), 
        key=lambda x: x[1].get('timestamp', 0)
    )
    
    # Keep only the most recent entries
    entries_to_keep = sorted_items[-MEMORY_CACHE_MAX_SIZE:]
    analysis_cache.clear()
    analysis_cache.update(dict(entries_to_keep))
    
    logger.info(f"Cleaned up memory cache, kept {len(analysis_cache)} entries")

# NEW: File-based cache implementation
class PersistentCache:
    def __init__(self, cache_dir=Config.CACHE_DIR):
        self.cache_dir = pathlib.Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Initialized persistent cache at {self.cache_dir}")
        
        # Load existing cache files into memory on startup
        self._load_cache_on_startup()
    
    def _get_cache_path(self, key):
        """Generate a filesystem path for a cache key."""
        # Create a safe filename from the cache key
        safe_key = key.replace("analysis_", "").replace(" ", "_")
        return self.cache_dir / f"{safe_key}.json"
    
    def _load_cache_on_startup(self):
        """Load cache entries from disk into memory."""
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, "r") as f:
                    data = json.load(f)
                
                # Check if the cache entry is still valid before loading
                if data and "timestamp" in data:
                    if (time.time() - data["timestamp"]) < Config.CACHE_TTL:
                        key = f"analysis_{cache_file.stem}"
                        analysis_cache[key] = data
                        count += 1
                    else:
                        # Remove expired cache files
                        cache_file.unlink(missing_ok=True)
                        logger.debug(f"Removed expired cache file: {cache_file}")
            except Exception as e:
                logger.warning(f"Error loading cache file {cache_file}: {str(e)}")
        
        logger.info(f"Loaded {count} valid cache entries from disk")
    
    def get(self, key):
        """Get an item from the persistent cache."""
        # First check in-memory cache
        if key in analysis_cache:
            logger.debug(f"Memory cache hit for {key}")
            return analysis_cache[key]
        
        # Then check filesystem cache
        cache_path = self._get_cache_path(key)
        if cache_path.exists():
            try:
                with open(cache_path, "r") as f:
                    data = json.load(f)
                
                # Check if the cache entry is still valid
                if data and "timestamp" in data:
                    if (time.time() - data["timestamp"]) < Config.CACHE_TTL:
                        # Update in-memory cache
                        analysis_cache[key] = data
                        logger.debug(f"File cache hit for {key}")
                        return data
                    else:
                        # Remove expired cache file
                        cache_path.unlink(missing_ok=True)
                        logger.debug(f"Removed expired cache file: {cache_path}")
            except Exception as e:
                logger.warning(f"Error reading cache file {cache_path}: {str(e)}")
        
        logger.debug(f"Cache miss for {key}")
        return None
    
    def set(self, key, data):
        """Store an item in the persistent cache with file locking."""
        # Update in-memory cache
        analysis_cache[key] = data
        
        # Clean up memory cache if it's getting too large
        cleanup_memory_cache()
        
        # Update filesystem cache with atomic write
        cache_path = self._get_cache_path(key)
        try:
            # Use atomic write to prevent corruption
            temp_path = cache_path.with_suffix('.tmp')
            
            with open(temp_path, "w") as f:
                # Lock the file during write
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                json.dump(data, f, indent=2)
                f.flush()
                os.fsync(f.fileno())  # Force write to disk
            
            # Atomic rename
            temp_path.rename(cache_path)
            logger.debug(f"Saved cache file for {key}")
        except Exception as e:
            logger.error(f"Error writing cache file {cache_path}: {str(e)}")
            # Clean up temp file if it exists
            if temp_path.exists():
                temp_path.unlink(missing_ok=True)
    
    def clear(self):
        """Clear all cache entries."""
        # Clear in-memory cache
        analysis_cache.clear()
        
        # Clear filesystem cache
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                cache_file.unlink(missing_ok=True)
            except Exception as e:
                logger.warning(f"Error removing cache file {cache_file}: {str(e)}")
        
        logger.info("Cleared all cache entries")
    
    def remove(self, key):
        """Remove a specific cache entry."""
        # Remove from in-memory cache
        if key in analysis_cache:
            del analysis_cache[key]
        
        # Remove from filesystem cache
        cache_path = self._get_cache_path(key)
        if cache_path.exists():
            try:
                cache_path.unlink(missing_ok=True)
                logger.debug(f"Removed cache file for {key}")
            except Exception as e:
                logger.warning(f"Error removing cache file {cache_path}: {str(e)}")
    
    def get_entry_count(self):
        """Count the number of cache files on disk."""
        return len(list(self.cache_dir.glob("*.json")))

# Initialize persistent cache
persistent_cache = PersistentCache()

# HTTP client configuration for external API calls
HTTP_LIMITS = httpx.Limits(max_keepalive_connections=20, max_connections=100)

# Initialize FastAPI app
app = FastAPI(
    title="Vehicle Analysis API",
    description="Backend service providing AI analysis of vehicle MOT history and technical bulletins",
    version="1.0.0",
)

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Cache", "Cache-Control"]
)

# App lifecycle events
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on app shutdown"""
    logger.info("Application shutting down")

# Add middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"{request.method} {request.url.path} - 500 - {process_time:.4f}s - Error: {str(e)}")
        raise

# Updated cache helper functions that use persistent cache
def is_cache_valid(cache_key):
    """Check if a cache entry is still valid."""
    if Config.USE_FILE_CACHE:
        # When using file cache, validity check is done in get()
        return persistent_cache.get(cache_key) is not None
    else:
        # Original in-memory only implementation
        if cache_key in analysis_cache:
            cache_time = analysis_cache[cache_key]["timestamp"]
            return (time.time() - cache_time) < Config.CACHE_TTL
    return False

def get_cached_analysis(cache_key):
    """Get analysis from cache if available and valid."""
    if Config.USE_FILE_CACHE:
        return persistent_cache.get(cache_key)
    else:
        if is_cache_valid(cache_key):
            logger.debug(f"Cache hit for {cache_key}")
            return analysis_cache[cache_key]
        logger.debug(f"Cache miss for {cache_key}")
        return None

def update_analysis_cache(cache_key, data):
    """Update the analysis cache with new data."""
    if Config.USE_FILE_CACHE:
        persistent_cache.set(cache_key, data)
    else:
        analysis_cache[cache_key] = data
        cleanup_memory_cache()  # Clean up memory cache for non-file cache mode too
    logger.debug(f"Updated cache for {cache_key}")

# Helper Functions
async def fetch_mot_data(registration: str):
    """Fetch MOT history data from the MOT API."""
    try:
        logger.info(f"Fetching MOT data for registration: {registration}")
        mot_api_url = f"{Config.MOT_API_URL}/api/v1/vehicle/registration/{registration}"
        
        async with httpx.AsyncClient(timeout=Config.TIMEOUT_SECONDS, limits=HTTP_LIMITS) as client:
            response = await client.get(mot_api_url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.warning(f"Vehicle not found: {registration}")
            raise HTTPException(status_code=404, detail="Vehicle not found")
        logger.error(f"MOT API error: {str(e)}")
        raise HTTPException(status_code=e.response.status_code, detail=f"MOT API error: {str(e)}")
    except httpx.RequestError as e:
        logger.error(f"Error connecting to MOT API: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Error connecting to MOT API: {str(e)}")

async def fetch_bulletin_data(make: str, model: str, engine_code: Optional[str] = None, year: Optional[int] = None):
    """Fetch technical bulletin data for the vehicle."""
    try:
        logger.info(f"Fetching bulletins for {make} {model}")
        
        # Prepare data for POST request to get better matching
        vehicle_data = {
            "make": make,
            "model": model
        }
        
        if engine_code:
            vehicle_data["engine_code"] = engine_code
        
        if year:
            vehicle_data["year"] = year
            
        async with httpx.AsyncClient(timeout=Config.TIMEOUT_SECONDS, limits=HTTP_LIMITS) as client:
            bulletins_api_url = f"{Config.BULLETINS_API_URL}/api/v1/bulletins/lookup"
            response = await client.post(bulletins_api_url, json=vehicle_data)
            
            if response.status_code == 404:
                # Try the simpler GET endpoint as fallback
                logger.info(f"No exact match found, trying GET endpoint")
                get_url = f"{Config.BULLETINS_API_URL}/api/v1/bulletins/lookup/{make}/{model}"
                response = await client.get(get_url)
            
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.warning(f"No bulletins found for {make} {model}")
            return {"bulletins": [], "categories": {}}  # Return empty data structure instead of raising exception
        logger.error(f"Bulletins API error: {str(e)}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Bulletins API error: {str(e)}")
    except httpx.RequestError as e:
        logger.error(f"Error connecting to Bulletins API: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Error connecting to Bulletins API: {str(e)}")

def prepare_mot_history_for_analysis(mot_data):
    """Clean and format MOT history for analysis."""
    if not mot_data or not mot_data.get("motTests"):
        return []
    
    return [
        {
            "date": test.get("completedDate"),
            "result": test.get("testResult"),
            "mileage": test.get("odometerValue"),
            "defects": [
                {
                    "text": defect.get("text"),
                    "type": defect.get("type"),
                    "category": defect.get("category", None)
                }
                for defect in test.get("defects", [])
            ]
        }
        for test in mot_data.get("motTests", [])
    ]

async def analyze_with_claude(registration: str, mot_data: dict, bulletin_data: dict, vehicle_info: dict):
    """Send data to Claude API for analysis."""
    try:
        logger.info(f"Analyzing data for {registration} with Claude API")
        
        mot_history = prepare_mot_history_for_analysis(mot_data)
        
        # Validate input data size before processing
        mot_history_str = json.dumps(mot_history, indent=2)
        bulletin_data_str = json.dumps(bulletin_data, indent=2)
        
        if len(mot_history_str) > Config.MAX_PROMPT_SIZE // 2:
            raise HTTPException(status_code=413, detail="MOT history data too large for analysis")
        
        if len(bulletin_data_str) > Config.MAX_PROMPT_SIZE // 2:
            raise HTTPException(status_code=413, detail="Bulletin data too large for analysis")
        
        # Prepare the prompt for Claude
        prompt = f"""I need to analyze MOT history and Technical Service Bulletins for a vehicle and produce a technical analysis component that would fit seamlessly in a premium vehicle report. 

Please analyze the patterns, potential issues, and correlations between the MOT history and known manufacturer issues for this {vehicle_info.get('make')} {vehicle_info.get('model')}.

Return the analysis in markdown format with these sections:
1. A top-level risk assessment table with visual indicators (use emoji ✓, ⚠️, 🔴)
2. Key Findings organized by vehicle system (only include systems with actual issues)
3. Technical Bulletin Matches table showing connections between MOT issues and known bulletins
4. MOT Failure Pattern analysis if relevant
5. Summary Notes that are factual and concise

IMPORTANT GUIDELINES:
- The analysis must be factual and ONLY based on information in the provided data
- Do NOT include any cost estimates or timeframes for repairs
- Do NOT make assumptions about future problems without evidence
- Do NOT include empty sections if there is no relevant data
- Make the analysis professional, concise, and informative

MOT History:
{mot_history_str}

Technical Service Bulletins:
{bulletin_data_str}"""
        
        # Validate final prompt size
        if len(prompt) > Config.MAX_PROMPT_SIZE:
            raise HTTPException(status_code=413, detail="Combined data too large for analysis")
        
        # Prepare the payload for Claude
        payload = {
            "model": Config.CLAUDE_MODEL,
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        # Call Claude API
        headers = {
            "Content-Type": "application/json",
            "x-api-key": Config.CLAUDE_API_KEY,
            "anthropic-version": Config.ANTHROPIC_VERSION
        }
        
        async with httpx.AsyncClient(timeout=Config.CLAUDE_TIMEOUT_SECONDS) as claude_client:
            claude_response = await claude_client.post(
                Config.CLAUDE_API_URL, 
                json=payload, 
                headers=headers
            )
            
            claude_response.raise_for_status()
            response_data = claude_response.json()
            
            # Validate response structure
            if not response_data or "content" not in response_data:
                raise HTTPException(status_code=502, detail="Invalid response from analysis service")
            
            if not response_data["content"] or len(response_data["content"]) == 0:
                raise HTTPException(status_code=502, detail="Empty response from analysis service")
            
            # Extract the analysis from Claude's response
            analysis = response_data["content"][0]["text"]
            
            # Validate response size
            if len(analysis) > Config.MAX_RESPONSE_SIZE:
                logger.warning(f"Large response received: {len(analysis)} characters")
                analysis = analysis[:Config.MAX_RESPONSE_SIZE] + "\n\n[Response truncated due to size]"
            
            return analysis
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API HTTP error: {e.response.status_code} - {str(e)}")
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Service temporarily unavailable due to rate limiting")
        elif e.response.status_code == 401:
            raise HTTPException(status_code=500, detail="Service configuration error")
        elif e.response.status_code >= 500:
            raise HTTPException(status_code=503, detail="External service temporarily unavailable")
        else:
            raise HTTPException(status_code=500, detail="Analysis service error")
    except httpx.TimeoutException as e:
        logger.error(f"Claude API timeout: {str(e)}")
        raise HTTPException(status_code=504, detail="Analysis service timeout")
    except httpx.RequestError as e:
        logger.error(f"Claude API request error: {str(e)}")
        raise HTTPException(status_code=503, detail="Analysis service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error analyzing with Claude: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal analysis error")

# API Routes
@app.get("/")
async def root():
    """Root endpoint - basic API info"""
    return {
        "name": "Vehicle Analysis API",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/vehicle-analysis/{registration}",
            "/api/v1/cache/clear",
            "/api/v1/cache/clear/{registration}",
            "/health"
        ]
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    file_cache_entries = persistent_cache.get_entry_count() if Config.USE_FILE_CACHE else None
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "cache_size": len(analysis_cache),
        "file_cache_entries": file_cache_entries
    }

@app.get("/api/v1/vehicle-analysis/{registration}", response_model=AnalysisResponse)
async def get_vehicle_analysis(registration: str, response: Response):
    """
    Get comprehensive AI analysis of a vehicle based on MOT history and technical bulletins.
    """
    # Normalize registration
    registration = registration.upper().strip()
    
    # Check cache first
    cache_key = f"analysis_{registration}"
    cached_result = get_cached_analysis(cache_key)
    
    if cached_result:
        # Set cache headers
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
        
        # Return cached analysis with cached flag
        cached_result["cached"] = True
        return cached_result
    
    # Set cache headers for new analysis
    response.headers["X-Cache"] = "MISS"
    response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
    
    try:
        # Step 1: Fetch MOT data
        mot_data = await fetch_mot_data(registration)
        
        if not mot_data:
            raise HTTPException(status_code=404, detail="No MOT data found for this vehicle")
        
        # Extract vehicle information
        make = mot_data.get("make")
        model = mot_data.get("model")
        engine_code = mot_data.get("engineCode")
        year = None
        
        # Try to extract year from registration date
        if mot_data.get("registrationDate"):
            try:
                reg_date = mot_data.get("registrationDate")
                if isinstance(reg_date, str) and len(reg_date) >= 4:
                    year = int(reg_date[:4])
            except:
                pass
        
        # If no year found, try manufacture date
        if not year and mot_data.get("manufactureDate"):
            try:
                manufacture_date = mot_data.get("manufactureDate")
                if isinstance(manufacture_date, str) and len(manufacture_date) >= 4:
                    year = int(manufacture_date[:4])
            except:
                pass
        
        # Prepare vehicle info dict
        vehicle_info = {
            "make": make,
            "model": model,
            "engineCode": engine_code,
            "year": year
        }
        
        if not make or not model:
            raise HTTPException(status_code=400, detail="Make and model information not available")
        
        # Step 2: Fetch technical bulletins data
        bulletin_data = await fetch_bulletin_data(make, model, engine_code, year)
        
        # Step 3: Analyze with Claude
        analysis = await analyze_with_claude(registration, mot_data, bulletin_data, vehicle_info)
        
        # Prepare response data
        result = {
            "registration": registration,
            "analysis": analysis,
            "make": make,
            "model": model,
            "timestamp": int(time.time()),
            "cached": False
        }
        
        # Cache the result
        update_analysis_cache(cache_key, result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing analysis for {registration}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the vehicle: {str(e)}"
        )

@app.post("/api/v1/cache/clear")
async def clear_cache():
    """Clear all caches."""
    if Config.USE_FILE_CACHE:
        persistent_cache.clear()
    else:
        global analysis_cache
        analysis_cache.clear()
    logger.info("Cache cleared manually")
    return {"status": "success", "message": "Cache cleared successfully"}

# NEW: Clear cache for specific registration
@app.post("/api/v1/cache/clear/{registration}")
async def clear_cache_for_registration(registration: str):
    """Clear cache for a specific vehicle registration."""
    registration = registration.upper().strip()
    cache_key = f"analysis_{registration}"
    
    if Config.USE_FILE_CACHE:
        persistent_cache.remove(cache_key)
    else:
        if cache_key in analysis_cache:
            del analysis_cache[cache_key]
    
    logger.info(f"Cache cleared for registration {registration}")
    return {"status": "success", "message": f"Cache cleared for registration {registration}"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        log_level="info"
    )