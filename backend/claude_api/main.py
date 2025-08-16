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
import tempfile
import fcntl
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
    CACHE_MAX_SIZE_MB = int(os.getenv("CACHE_MAX_SIZE_MB", "100"))  # 100MB default
    CACHE_MAX_FILES = int(os.getenv("CACHE_MAX_FILES", "1000"))  # 1000 files default
    
    # Rate limiting settings
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "5"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "60"))  # 5 requests per minute
    
    # Timeout settings
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", "30"))

# Pydantic models for API requests and responses
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    cache_size: int
    file_cache_entries: Optional[int] = None

class SystemStatus(BaseModel):
    name: str
    status: str  # "good", "warning", "poor"
    notes: str

class RiskAssessment(BaseModel):
    overall: str  # "good", "warning", "poor"
    systems: List[SystemStatus]

class KeyFinding(BaseModel):
    system: str
    issues: List[str]
    severity: str  # "good", "warning", "poor"

class BulletinMatch(BaseModel):
    bulletin: str
    title: str
    motConnection: str

class MotPatterns(BaseModel):
    hasPatterns: bool
    description: str
    timeline: List[str]

class Summary(BaseModel):
    notes: List[str]

class StructuredAnalysis(BaseModel):
    riskAssessment: RiskAssessment
    keyFindings: List[KeyFinding]
    bulletinMatches: List[BulletinMatch]
    motPatterns: MotPatterns
    summary: Summary

class AnalysisResponse(BaseModel):
    registration: str
    analysis: StructuredAnalysis
    make: Optional[str] = None
    model: Optional[str] = None
    timestamp: int
    cached: bool = False

# In-memory cache for analysis results
analysis_cache = {}

# Request deduplication - track pending requests to prevent duplicate API calls
pending_requests = {}

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
        # Update in-memory cache first
        analysis_cache[key] = data
        
        # Update filesystem cache with atomic write and locking
        cache_path = self._get_cache_path(key)
        try:
            # Write to temporary file first, then atomic move
            temp_path = cache_path.with_suffix('.tmp')
            
            with open(temp_path, "w") as f:
                # Lock the file to prevent concurrent writes
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                json.dump(data, f, indent=2)
                f.flush()
                os.fsync(f.fileno())  # Ensure data is written to disk
            
            # Atomic move - this prevents partial reads
            temp_path.replace(cache_path)
            logger.debug(f"Saved cache file for {key}")
            
            # Enforce cache limits after successful write
            self.enforce_cache_limits()
            
        except Exception as e:
            logger.error(f"Error writing cache file {cache_path}: {str(e)}")
            # Clean up temp file if it exists
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except:
                    pass
    
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
    
    def get_cache_size_mb(self):
        """Get total cache size in MB."""
        total_size = 0
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                total_size += cache_file.stat().st_size
            except:
                pass
        return total_size / (1024 * 1024)  # Convert to MB
    
    def cleanup_old_entries(self):
        """Remove oldest entries if cache exceeds limits."""
        cache_files = list(self.cache_dir.glob("*.json"))
        
        # Check if we exceed file count limit
        if len(cache_files) > Config.CACHE_MAX_FILES:
            # Sort by modification time (oldest first)
            cache_files.sort(key=lambda f: f.stat().st_mtime)
            files_to_remove = len(cache_files) - Config.CACHE_MAX_FILES
            
            for cache_file in cache_files[:files_to_remove]:
                try:
                    # Remove from in-memory cache too
                    key = f"analysis_{cache_file.stem}"
                    if key in analysis_cache:
                        del analysis_cache[key]
                    
                    cache_file.unlink()
                    logger.debug(f"Removed old cache file: {cache_file}")
                except Exception as e:
                    logger.warning(f"Error removing old cache file {cache_file}: {str(e)}")
        
        # Check if we exceed size limit
        current_size = self.get_cache_size_mb()
        if current_size > Config.CACHE_MAX_SIZE_MB:
            # Sort remaining files by modification time (oldest first)
            remaining_files = list(self.cache_dir.glob("*.json"))
            remaining_files.sort(key=lambda f: f.stat().st_mtime)
            
            # Remove files until we're under the size limit
            for cache_file in remaining_files:
                if current_size <= Config.CACHE_MAX_SIZE_MB * 0.8:  # Stop at 80% of limit
                    break
                
                try:
                    file_size_mb = cache_file.stat().st_size / (1024 * 1024)
                    
                    # Remove from in-memory cache too
                    key = f"analysis_{cache_file.stem}"
                    if key in analysis_cache:
                        del analysis_cache[key]
                    
                    cache_file.unlink()
                    current_size -= file_size_mb
                    logger.debug(f"Removed cache file for size limit: {cache_file}")
                except Exception as e:
                    logger.warning(f"Error removing cache file {cache_file}: {str(e)}")
    
    def enforce_cache_limits(self):
        """Check and enforce cache size limits after each write."""
        try:
            self.cleanup_old_entries()
        except Exception as e:
            logger.error(f"Error enforcing cache limits: {str(e)}")

# Initialize persistent cache
persistent_cache = PersistentCache()

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
    logger.debug(f"Updated cache for {cache_key}")

# Helper Functions
async def fetch_mot_data(registration: str):
    """Fetch MOT history data from the MOT API."""
    try:
        logger.info(f"Fetching MOT data for registration: {registration}")
        async with httpx.AsyncClient(timeout=Config.TIMEOUT_SECONDS) as client:
            mot_api_url = f"{Config.MOT_API_URL}/api/v1/vehicle/registration/{registration}"
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
            
        async with httpx.AsyncClient(timeout=Config.TIMEOUT_SECONDS) as client:
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
        
        # Prepare the prompt for Claude
        prompt = f"""I need to analyze MOT history and Technical Service Bulletins for a vehicle and produce a technical analysis for a premium vehicle report.

Please analyze the patterns, potential issues, and correlations between the MOT history and known manufacturer issues for this {vehicle_info.get('make')} {vehicle_info.get('model')}.

Return your analysis as a JSON object with this exact structure:

{{
  "riskAssessment": {{
    "overall": "good|warning|poor",
    "systems": [
      {{"name": "Engine", "status": "good|warning|poor", "notes": "Brief status description"}}
    ]
  }},
  "keyFindings": [
    {{
      "system": "System Name (e.g., Braking System)",
      "issues": ["List of specific issues found"],
      "severity": "good|warning|poor"
    }}
  ],
  "bulletinMatches": [
    {{
      "bulletin": "Bulletin ID or reference",
      "title": "Brief title of the bulletin",
      "motConnection": "How this relates to MOT history"
    }}
  ],
  "motPatterns": {{
    "hasPatterns": true/false,
    "description": "Description of any patterns found",
    "timeline": ["Key timeline events if patterns exist"]
  }},
  "summary": {{
    "notes": ["Key summary points about the vehicle"]
  }}
}}

IMPORTANT GUIDELINES:
- Return ONLY valid JSON, no markdown or extra text
- The analysis must be factual and ONLY based on information in the provided data
- Do NOT include any cost estimates or timeframes for repairs
- Do NOT make assumptions about future problems without evidence
- Only include sections with actual data - omit empty arrays/objects
- Use "good" (✓), "warning" (⚠️), or "poor" (🔴) for status values
- Be professional, concise, and informative

MOT History:
{json.dumps(mot_history, indent=2)}

Technical Service Bulletins:
{json.dumps(bulletin_data, indent=2)}"""
        
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
        async with httpx.AsyncClient(timeout=60) as client:  # Longer timeout for Claude
            headers = {
                "Content-Type": "application/json",
                "x-api-key": Config.CLAUDE_API_KEY,
                "anthropic-version": Config.ANTHROPIC_VERSION
            }
            
            claude_response = await client.post(
                Config.CLAUDE_API_URL, 
                json=payload, 
                headers=headers
            )
            
            claude_response.raise_for_status()
            response_data = claude_response.json()
            
            # Extract the analysis from Claude's response
            raw_analysis = response_data["content"][0]["text"]
            
            # Parse and validate the JSON response from Claude
            try:
                # Claude sometimes wraps JSON in markdown code blocks, so clean it
                cleaned_text = raw_analysis.strip()
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]  # Remove ```json
                if cleaned_text.startswith('```'):
                    cleaned_text = cleaned_text[3:]   # Remove ```
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]  # Remove trailing ```
                
                cleaned_text = cleaned_text.strip()
                
                # Parse the JSON
                analysis_data = json.loads(cleaned_text)
                
                # Validate required structure
                required_keys = ["riskAssessment", "keyFindings", "bulletinMatches", "motPatterns", "summary"]
                for key in required_keys:
                    if key not in analysis_data:
                        logger.warning(f"Missing required key '{key}' in Claude response")
                        analysis_data[key] = {} if key in ["riskAssessment", "motPatterns", "summary"] else []
                
                return analysis_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Claude JSON response: {str(e)}")
                logger.error(f"Raw response: {raw_analysis}")
                
                # Fallback: return a basic structure with error info
                return {
                    "riskAssessment": {
                        "overall": "warning",
                        "systems": [{"name": "Analysis", "status": "warning", "notes": "Analysis format error"}]
                    },
                    "keyFindings": [],
                    "bulletinMatches": [],
                    "motPatterns": {"hasPatterns": False, "description": "", "timeline": []},
                    "summary": {"notes": ["Analysis could not be processed properly"]}
                }
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API error: {str(e)}")
        try:
            error_details = e.response.json()
            error_message = error_details.get("error", {}).get("message", str(e))
        except:
            error_message = str(e)
        raise HTTPException(status_code=500, detail=f"Claude API error: {error_message}")
    except Exception as e:
        logger.error(f"Error analyzing with Claude: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing with Claude: {str(e)}")

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
    
    # Check if there's already a pending request for this registration
    if registration in pending_requests:
        logger.info(f"Request already pending for {registration}, waiting for completion")
        # Wait for the pending request to complete
        try:
            result = await pending_requests[registration]
            result["cached"] = False  # This was generated during this session
            response.headers["X-Cache"] = "DEDUPED"
            response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
            return result
        except Exception as e:
            # If the pending request failed, continue with new request
            logger.warning(f"Pending request failed for {registration}: {str(e)}")
            if registration in pending_requests:
                del pending_requests[registration]
    
    # Set cache headers for new analysis
    response.headers["X-Cache"] = "MISS"
    response.headers["Cache-Control"] = f"max-age={Config.CACHE_TTL}"
    
    # Create a task for this request to handle deduplication
    async def process_analysis():
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
    
    # Store the task to handle concurrent requests
    pending_requests[registration] = process_analysis()
    
    try:
        result = await pending_requests[registration]
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing analysis for {registration}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the vehicle: {str(e)}"
        )
    finally:
        # Clean up the pending request
        if registration in pending_requests:
            del pending_requests[registration]

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