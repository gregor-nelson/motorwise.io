from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import time
import logging
import logging.handlers
import json
from bs4 import BeautifulSoup
from functools import lru_cache
import os
import threading
from collections import OrderedDict
import sys
import random
from queue import Queue
from threading import Thread
from concurrent.futures import ThreadPoolExecutor
import zlib

# Configure logging
os.makedirs("/home/debian/insurance-api/logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.handlers.RotatingFileHandler(
            "/home/debian/insurance-api/logs/insurance_api.log",
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
    ]
)
logger = logging.getLogger("insurance_api")

# Initialize Flask app
app = Flask(__name__)

# Configuration
CONFIG = {
    "PORT": int(os.environ.get("API_PORT", 8004)),
    "HOST": os.environ.get("API_HOST", "127.0.0.1"),
    "DEBUG": os.environ.get("API_DEBUG", "False").lower() == "true",
    "TOKEN_CACHE_TTL": int(os.environ.get("TOKEN_CACHE_TTL", 3600 - 300)),  # Token TTL minus 5 minute buffer
    "VEHICLE_CACHE_TTL": int(os.environ.get("VEHICLE_CACHE_TTL", 300)),     # 5 minutes
    "MAX_CACHE_ITEMS": int(os.environ.get("MAX_CACHE_ITEMS", 1000)),        # Maximum cache size
    "CREDENTIALS_FILE": os.environ.get("CREDENTIALS_FILE", "/home/debian/insurance-api/mib_credentials.json"),
    "REQUEST_COOLDOWN": float(os.environ.get("REQUEST_COOLDOWN", 0.2)),     # Reduced from 1.0
    "REQUEST_TIMEOUT": int(os.environ.get("REQUEST_TIMEOUT", 15)),          # Reduced from 30 to 15
    "MAX_RETRIES": int(os.environ.get("MAX_RETRIES", 2)),
    "CORS_ORIGINS": ["https://check-mot.co.uk", "https://www.check-mot.co.uk",
                     "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    "BEHIND_PROXY": True,
    "RATE_LIMIT_WINDOW": int(os.environ.get("RATE_LIMIT_WINDOW", 60)),      # 1 minute
    "RATE_LIMIT_MAX": int(os.environ.get("RATE_LIMIT_MAX", 30)),           # 30 requests per minute
    "MAX_MEMORY_PERCENT": float(os.environ.get("MAX_MEMORY_PERCENT", 80.0)),  # 80% memory threshold
    "INTERNAL_API_KEY": os.environ.get("INTERNAL_API_KEY", "")
}

# User agents for randomization
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
]

# Base headers with randomization
def get_random_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://enquiry.navigate.mib.org.uk",
        "Referer": "https://enquiry.navigate.mib.org.uk/",
        "Accept-Language": "en-US,en;q=0.9"
    }

# CORS setup
CORS(app,
     origins=CONFIG["CORS_ORIGINS"],
     supports_credentials=True,
     methods=["GET", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control"])

# Cache and stats
CACHE_STATS = {
    "token_requests": 0,
    "token_errors": 0,
    "vehicle_requests": 0,
    "vehicle_hits": 0,
    "vehicle_misses": 0,
    "vehicle_errors": 0,
    "vehicle_403_count": 0,
    "last_request_time": 0
}

STATS = {"success": 0, "failure": 0}

# Rate limiting and queue
RATE_LIMIT = {
    "requests": [],
    "backoff_until": 0
}
REQUEST_QUEUE = Queue()
executor = ThreadPoolExecutor(max_workers=5)

# Circuit breaker
CIRCUIT_BREAKER = {
    "failures": 0,
    "last_failure": 0,
    "open_until": 0,
    "threshold": 5,
    "timeout": 60,
    "state": "closed"  # closed, open, half-open
}

# Size-limited cache with compression
class LimitedCache(OrderedDict):
    def __init__(self, max_items=CONFIG["MAX_CACHE_ITEMS"]):
        super().__init__()
        self.max_items = max_items

    def __setitem__(self, key, value):
        if key in self:
            self.move_to_end(key)
        elif len(self) >= self.max_items:
            self.popitem(last=False)
        super().__setitem__(key, value)

TOKEN_CACHE = {"access_token": None, "expires_at": 0}
VEHICLE_CACHE = LimitedCache()
api_lock = threading.RLock()

# Utility functions
def check_memory_usage():
    """Check if memory usage is below threshold"""
    try:
        import psutil
        memory = psutil.virtual_memory()
        if memory.percent > CONFIG["MAX_MEMORY_PERCENT"]:
            logger.warning(f"Memory usage high: {memory.percent}%. Clearing caches.")
            VEHICLE_CACHE.clear()
            return False
        return True
    except ImportError:
        return True

def compress_data(data):
    """Compress data for caching"""
    return zlib.compress(json.dumps(data).encode())

def decompress_data(compressed):
    """Decompress cached data"""
    return json.loads(zlib.decompress(compressed).decode())

def load_credentials_from_disk():
    """Load client credentials from disk if available"""
    try:
        if os.path.exists(CONFIG["CREDENTIALS_FILE"]):
            with open(CONFIG["CREDENTIALS_FILE"], 'r') as f:
                data = json.load(f)
                logger.info("Loaded credentials from disk cache")
                return data.get("client_id"), data.get("client_secret")
    except Exception as e:
        logger.warning(f"Failed to load credentials from disk: {e}")
    return None, None

def save_credentials_to_disk(client_id, client_secret):
    """Save client credentials to disk for persistence"""
    try:
        os.makedirs(os.path.dirname(CONFIG["CREDENTIALS_FILE"]), exist_ok=True)
        with open(CONFIG["CREDENTIALS_FILE"], 'w') as f:
            json.dump({"client_id": client_id, "client_secret": client_secret}, f)
        logger.info("Saved credentials to disk cache")
    except Exception as e:
        logger.warning(f"Failed to save credentials to disk: {e}")

def enforce_rate_limits(response=None):
    """Enforce rate limits with dynamic backoff"""
    with api_lock:
        current_time = time.time()
        if response and response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            if retry_after:
                backoff = int(retry_after)
                logger.warning(f"429 detected, dynamic backoff for {backoff}s")
                RATE_LIMIT["backoff_until"] = current_time + backoff
                time.sleep(backoff)
                return

        window_start = current_time - CONFIG["RATE_LIMIT_WINDOW"]
        RATE_LIMIT["requests"] = [t for t in RATE_LIMIT["requests"] if t > window_start]
        if len(RATE_LIMIT["requests"]) >= CONFIG["RATE_LIMIT_MAX"]:
            backoff_time = max(5, CONFIG["RATE_LIMIT_WINDOW"] - (current_time - RATE_LIMIT["requests"][0]))
            logger.warning(f"Rate limit reached. Backoff for {backoff_time}s")
            time.sleep(backoff_time)
            RATE_LIMIT["backoff_until"] = current_time + backoff_time
        RATE_LIMIT["requests"].append(current_time)

def queue_request(func, *args, **kwargs):
    """Add request to queue and process asynchronously"""
    REQUEST_QUEUE.put((func, args, kwargs))

def process_queue():
    """Worker thread to process queued requests"""
    while True:
        func, args, kwargs = REQUEST_QUEUE.get()
        try:
            enforce_rate_limits()
            func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Queue error: {e}")
        finally:
            REQUEST_QUEUE.task_done()

# Start queue worker
Thread(target=process_queue, daemon=True).start()

def circuit_breaker_check():
    """Check if circuit breaker is open"""
    with api_lock:
        current_time = time.time()
        if CIRCUIT_BREAKER["state"] == "open" and current_time < CIRCUIT_BREAKER["open_until"]:
            raise Exception("Circuit breaker open - API temporarily unavailable")
        elif CIRCUIT_BREAKER["state"] == "open" and current_time >= CIRCUIT_BREAKER["open_until"]:
            logger.info("Circuit breaker entering half-open state")
            CIRCUIT_BREAKER["state"] = "half-open"

def circuit_breaker_success():
    """Record a successful API call"""
    with api_lock:
        if CIRCUIT_BREAKER["state"] == "half-open":
            logger.info("Circuit breaker closing after successful test")
            CIRCUIT_BREAKER["state"] = "closed"
        CIRCUIT_BREAKER["failures"] = 0

def circuit_breaker_failure():
    """Record a failed API call"""
    with api_lock:
        current_time = time.time()
        CIRCUIT_BREAKER["failures"] += 1
        CIRCUIT_BREAKER["last_failure"] = current_time
        if CIRCUIT_BREAKER["failures"] >= CIRCUIT_BREAKER["threshold"]:
            logger.warning("Circuit breaker opening")
            CIRCUIT_BREAKER["state"] = "open"
            CIRCUIT_BREAKER["open_until"] = current_time + CIRCUIT_BREAKER["timeout"]

@lru_cache(maxsize=1)
def fetch_credentials():
    """Fetch client credentials from the Navigate website"""
    client_id = os.environ.get("MIB_CLIENT_ID")
    client_secret = os.environ.get("MIB_CLIENT_SECRET")
    if client_id and client_secret:
        logger.info("Using credentials from environment variables")
        return client_id, client_secret

    client_id, client_secret = load_credentials_from_disk()
    if client_id and client_secret:
        try:
            test_auth = requests.post(
                "https://api.navigate.mib.org.uk/usermanagement/api/v1/admin/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={"grant_type": "client_credentials", "client_id": client_id,
                      "client_secret": client_secret, "scope": "api"},
                timeout=CONFIG["REQUEST_TIMEOUT"]
            )
            if test_auth.status_code == 200:
                return client_id, client_secret
            logger.warning("Cached credentials expired, fetching new ones")
        except Exception as e:
            logger.warning(f"Failed to validate cached credentials: {e}")

    url = "https://enquiry.navigate.mib.org.uk/checkyourvehicle"
    try:
        logger.info("Fetching credentials from Navigate website")
        response = requests.get(url, headers=get_random_headers(), timeout=CONFIG["REQUEST_TIMEOUT"])
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        script_tags = soup.find_all("script", {"src": re.compile(r"_next/static/chunks/.*\.js")})
        js_urls = [f"https://enquiry.navigate.mib.org.uk{tag['src']}" for tag in script_tags]

        patterns = [
            (re.compile(r'client_id["\']?\s*[:=]\s*["\']([0-9a-zA-Z]+)["\']'),
             re.compile(r'client_secret["\']?\s*[:=]\s*["\']([0-9a-zA-Z\-_]+)["\']')),
            (re.compile(r'client_id=([0-9a-zA-Z]+)'),
             re.compile(r'client_secret=([0-9a-zA-Z\-_]+)')),
            (re.compile(r'[,{](?:[a-z])+=(?:\{)?[a-z]+:["\'](0oac[0-9a-zA-Z]+)["\']'),
             re.compile(r'[,{](?:[a-z])+=(?:\{)?[a-z]+:["\'](ExB[0-9a-zA-Z\-_]+)["\']')),
            (re.compile(r'grant_type=client_credentials&client_id=([0-9a-zA-Z]+)'),
             re.compile(r'client_secret=([0-9a-zA-Z\-_]+)&scope=api'))
        ]

        client_id = None
        client_secret = None
        for js_url in js_urls:
            js_response = requests.get(js_url, headers=get_random_headers(), timeout=CONFIG["REQUEST_TIMEOUT"])
            if js_response.status_code != 200:
                continue
            js_content = js_response.text
            for id_pattern, secret_pattern in patterns:
                if not client_id:
                    id_match = id_pattern.search(js_content)
                    if id_match:
                        client_id = id_match.group(1)
                if not client_secret:
                    secret_match = secret_pattern.search(js_content)
                    if secret_match:
                        client_secret = secret_match.group(1)
                if client_id and client_secret:
                    break
            if client_id and client_secret:
                break

        if not client_id or not client_secret:
            logger.warning("Failed to extract credentials, falling back to hardcoded values")
            client_id = "0oac8nzed80YQWzCL0i7"
            client_secret = "ExBCGyA-LaO4uVw0nYhSSupS21IBxAnqiO85bQc-ZODSx6FAhilLU9BtmrOAlSPp"

        logger.info(f"Successfully obtained credentials: client_id={client_id[:5]}...")
        save_credentials_to_disk(client_id, client_secret)
        return client_id, client_secret
    except Exception as e:
        logger.error(f"Error fetching credentials: {e}")
        client_id = "0oac8nzed80YQWzCL0i7"
        client_secret = "ExBCGyA-LaO4uVw0nYhSSupS21IBxAnqiO85bQc-ZODSx6FAhilLU9BtmrOAlSPp"
        logger.warning("Using fallback hardcoded credentials")
        return client_id, client_secret

def get_access_token(force_refresh=False):
    """Get OAuth access token with caching"""
    with api_lock:
        current_time = time.time()
        buffer = CONFIG["TOKEN_CACHE_TTL"] * 0.05
        if (not force_refresh and TOKEN_CACHE["access_token"] and
            TOKEN_CACHE["expires_at"] > current_time + buffer):
            logger.debug("Using cached token")
            return TOKEN_CACHE["access_token"]

        CACHE_STATS["token_requests"] += 1
        logger.info("Refreshing access token")
        client_id, client_secret = fetch_credentials()
        url = "https://api.navigate.mib.org.uk/usermanagement/api/v1/admin/token"
        auth_headers = get_random_headers()
        auth_headers["Content-Type"] = "application/x-www-form-urlencoded"
        payload = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": "api"
        }
        try:
            circuit_breaker_check()
            response = requests.post(url, headers=auth_headers, data=payload, timeout=CONFIG["REQUEST_TIMEOUT"])
            response.raise_for_status()
            token_data = response.json()
            circuit_breaker_success()
            TOKEN_CACHE["access_token"] = token_data["access_token"]
            TOKEN_CACHE["expires_at"] = current_time + token_data.get("expires_in", 3600) - 300
            logger.info("Successfully obtained new access token")
            return TOKEN_CACHE["access_token"]
        except requests.exceptions.RequestException as e:
            CACHE_STATS["token_errors"] += 1
            circuit_breaker_failure()
            logger.error(f"Failed to authenticate with MIB API: {str(e)}")
            raise Exception(f"Failed to authenticate with MIB API: {str(e)}")

def validate_vrm(vrm):
    """Validate UK vehicle registration number format"""
    vrm = vrm.replace(" ", "").upper()
    if len(vrm) < 2 or len(vrm) > 7:
        return False
    invalid_patterns = ['TEST', 'DEMO', 'EXAMPLE', 'INVALID']
    if any(pattern in vrm for pattern in invalid_patterns):
        return False
    return bool(re.match(r'^[A-Z0-9]{2,7}$', vrm))

def get_cached_vehicle_data(cache_key):
    """Get vehicle data from cache if available and valid"""
    if cache_key in VEHICLE_CACHE:
        cache_item = VEHICLE_CACHE[cache_key]
        if (time.time() - cache_item["timestamp"]) < CONFIG["VEHICLE_CACHE_TTL"]:
            CACHE_STATS["vehicle_hits"] += 1
            logger.debug(f"Cache hit for {cache_key}")
            return decompress_data(cache_item["data"])
    CACHE_STATS["vehicle_misses"] += 1
    logger.debug(f"Cache miss for {cache_key}")
    return None

def update_vehicle_cache(cache_key, data):
    """Update the vehicle cache with new data"""
    VEHICLE_CACHE[cache_key] = {
        "data": compress_data(data),
        "timestamp": time.time()
    }
    logger.debug(f"Updated cache for {cache_key}")

def notify_vehicle_api(vrm, status):
    """Notify main vehicle API about insurance check"""
    try:
        requests.post(
            "http://127.0.0.1:8000/api/v1/internal/insurance-notification",
            json={"vrm": vrm, "status": status},
            headers={"X-API-Key": CONFIG["INTERNAL_API_KEY"]},
            timeout=2
        )
    except Exception as e:
        logger.warning(f"Failed to notify vehicle API: {e}")

def check_vehicle_insurance_with_context(token, vrm, request_context):
    """Check the insurance status of a vehicle registration number, with request context"""
    CACHE_STATS["vehicle_requests"] += 1
    circuit_breaker_check()

    cache_key = f"insurance_{vrm}"
    auth_headers = get_random_headers()
    auth_headers["Authorization"] = f"Bearer {token}"
    auth_headers["Content-Type"] = "application/json"
    auth_headers["X-Forwarded-For"] = request_context.remote_addr # Add client IP header
    payload = {"vrm": vrm}
    retries = CONFIG["MAX_RETRIES"]
    backoff = 2 + random.uniform(0, 1)

    for attempt in range(retries + 1):
        try:
            enforce_rate_limits()
            with api_lock:
                time_since_last = time.time() - CACHE_STATS.get("last_request_time", 0)
                if time_since_last < CONFIG["REQUEST_COOLDOWN"]:
                    wait_time = CONFIG["REQUEST_COOLDOWN"] - time_since_last + random.uniform(0, 0.1)
                    logger.debug(f"Rate limit protection: waiting {wait_time:.2f}s")
                    time.sleep(wait_time)
                CACHE_STATS["last_request_time"] = time.time()

            response = requests.post(
                "https://cyv.navigate.mib.org.uk/ovl/api/v1/ovlsearch",
                headers=auth_headers,
                json=payload,
                timeout=CONFIG["REQUEST_TIMEOUT"]
            )
            if "text/html" in response.headers.get("Content-Type", ""):
                logger.warning(f"HTML response received for {vrm}, likely WAF blocking")
                if attempt < retries:
                    logger.warning(f"Retrying after {backoff}s delay... (Attempt {attempt + 1}/{retries})")
                    time.sleep(backoff)
                    backoff *= 2 + random.uniform(0, 1)
                    auth_headers = get_random_headers()
                    auth_headers["X-Forwarded-For"] = request_context.remote_addr # Re-add client IP header after refresh
                    continue
                return {"errorDetails": {"errType": "GATEWAY_BLOCKED", "errMessage": "Request blocked by API gateway"}}, False

            if response.status_code == 401 and attempt < retries:
                logger.warning("401 detected, refreshing token")
                token = get_access_token(force_refresh=True)
                auth_headers["Authorization"] = f"Bearer {token}"
                auth_headers["X-Forwarded-For"] = request_context.remote_addr # Re-add client IP header after token refresh
                continue

            enforce_rate_limits(response)
            if response.status_code == 200:
                circuit_breaker_success()
                STATS["success"] += 1
                return response.json(), True
            elif response.status_code == 400:
                circuit_breaker_success()
                STATS["success"] += 1
                return response.json(), False
            elif response.status_code == 403:
                CACHE_STATS["vehicle_403_count"] += 1
                logger.warning(f"403 Forbidden received for {vrm}")
                if attempt < retries:
                    logger.warning(f"Retrying after {backoff}s delay... (Attempt {attempt + 1}/{retries})")
                    time.sleep(backoff)
                    backoff *= 2 + random.uniform(0, 1)
                    auth_headers = get_random_headers()
                    auth_headers["X-Forwarded-For"] = request_context.remote_addr # Re-add client IP header after retry
                    continue
                circuit_breaker_failure()
                STATS["failure"] += 1
                return {"errorDetails": {"errType": "ACCESS_DENIED", "errMessage": "Access restricted"}}, False
            else:
                logger.error(f"Vehicle search failed: {response.status_code} - {response.text}")
                if attempt < retries:
                    logger.warning(f"Retrying after {backoff}s delay... (Attempt {attempt + 1}/{retries})")
                    time.sleep(backoff)
                    backoff *= 2 + random.uniform(0, 1)
                    auth_headers = get_random_headers()
                    auth_headers["X-Forwarded-For"] = request_context.remote_addr # Re-add client IP header after retry
                    continue
                circuit_breaker_failure()
                STATS["failure"] += 1
                raise Exception(f"Vehicle search failed: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            STATS["failure"] += 1
            if "ConnectTimeout" in str(e) or "ConnectionError" in str(e):
                logger.error(f"External API connectivity issue: {str(e)}")
                cached = get_cached_vehicle_data(cache_key)
                if cached:
                    logger.warning(f"Returning expired cache for {vrm} due to API connectivity issue")
                    return cached, cached["insuranceStatus"] == "INSURED"
            if attempt < retries:
                logger.warning(f"Request error: {str(e)}. Retrying... (Attempt {attempt + 1}/{retries})")
                time.sleep(backoff)
                backoff *= 2 + random.uniform(0, 1)
                auth_headers = get_random_headers()
                auth_headers["X-Forwarded-For"] = request_context.remote_addr # Re-add client IP header after retry
                continue
            CACHE_STATS["vehicle_errors"] += 1
            circuit_breaker_failure()
            raise Exception(f"Request error after retries: {str(e)}")


def check_vehicle_insurance(token, vrm): # Keeping the old name for queue compatibility, but it will not be directly called by route anymore
    pass # This function is now effectively unused in direct route calls

def format_insurance_response(data, is_insured, vrm):
    """Format insurance check response for consistent API output"""
    response = {
        "registration": vrm.upper(),
        "insuranceStatus": "INSURED" if is_insured else "NOT_INSURED",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    if is_insured and "data" in data:
        vehicle_data = data["data"]
        response.update({
            "make": vehicle_data.get("vehicleMake", "Unknown"),
            "model": vehicle_data.get("vehicleModel", "Unknown"),
        })
    elif not is_insured and "errorDetails" in data:
        response.update({
            "reason": data["errorDetails"].get("errMessage", "Unknown reason")
        })
    if CONFIG["INTERNAL_API_KEY"]:
        threading.Thread(target=notify_vehicle_api,
                        args=(vrm, "INSURED" if is_insured else "NOT_INSURED"),
                        daemon=True).start()
    return response

def cleanup_expired_cache():
    """Remove expired cache entries to free memory"""
    current_time = time.time()
    expired_keys = [key for key, value in VEHICLE_CACHE.items() if (current_time - value["timestamp"]) > CONFIG["VEHICLE_CACHE_TTL"]]
    for key in expired_keys:
        VEHICLE_CACHE.pop(key, None)
    if expired_keys:
        logger.info(f"Cache cleanup: removed {len(expired_keys)} expired entries, {len(VEHICLE_CACHE)} remaining")
    cleanup_timer = threading.Timer(300, cleanup_expired_cache)
    cleanup_timer.daemon = True
    cleanup_timer.start()

# Middleware
@app.before_request
def handle_proxy_headers():
    if CONFIG.get("BEHIND_PROXY", False):
        if request.headers.get("X-Forwarded-For"):
            request.remote_addr = request.headers.get("X-Forwarded-For").split(',')[0].strip()
        if request.headers.get("X-Forwarded-Proto"):
            request.scheme = request.headers.get("X-Forwarded-Proto")

@app.before_request
def validate_request():
    allowed_paths = ['/api/v1/vehicle/insurance/', '/health', '/api/v1/stats/cache', '/api/v1/cache/clear', '/metrics', '/']
    if not any(request.path.startswith(path) for path in allowed_paths) and request.path != '/':
        return jsonify({"status": "error", "errorMessage": "Invalid endpoint"}), 404

@app.before_request
def log_request_info():
    logger.info(f"Request: {request.method} {request.path} - IP: {request.remote_addr}")

@app.after_request
def add_headers_and_log(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    logger.info(f"Response: {response.status_code}")
    return response

# API routes
@app.route("/")
def root():
    """Root endpoint - basic API info"""
    return jsonify({
        "name": "Vehicle Insurance Check API",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/vehicle/insurance/{registration}",
            "/api/v1/stats/cache",
            "/health",
            "/api/v1/cache/clear",
            "/metrics"
        ]
    })

@app.route("/health")
def health_check():
    """Health check endpoint for monitoring"""
    memory_ok = check_memory_usage()
    cache_hit_ratio = 0
    total_requests = CACHE_STATS["vehicle_hits"] + CACHE_STATS["vehicle_misses"]
    if total_requests > 0:
        cache_hit_ratio = (CACHE_STATS["vehicle_hits"] / total_requests) * 100
    api_status = "healthy"
    try:
        get_access_token()
    except Exception as e:
        api_status = f"degraded: {str(e)}"
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "api_status": api_status,
        "memory_status": "ok" if memory_ok else "high",
        "cache": {"vehicle_entries": len(VEHICLE_CACHE), "hit_ratio": f"{cache_hit_ratio:.1f}%"},
        "rate_limits": {"recent_requests": len(RATE_LIMIT["requests"]), "in_backoff": time.time() < RATE_LIMIT["backoff_until"]},
        "circuit_breaker": {"status": CIRCUIT_BREAKER["state"], "failures": CIRCUIT_BREAKER["failures"]}
    })

@app.route("/api/v1/stats/cache", methods=["GET"])
def cache_stats():
    """Get cache statistics (for monitoring)"""
    if CONFIG["INTERNAL_API_KEY"]:
        auth_header = request.headers.get("Authorization", "")
        if f"Bearer {CONFIG['INTERNAL_API_KEY']}" != auth_header:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
    cache_hit_ratio = 0
    total_requests = CACHE_STATS["vehicle_hits"] + CACHE_STATS["vehicle_misses"]
    if total_requests > 0:
        cache_hit_ratio = (CACHE_STATS["vehicle_hits"] / total_requests) * 100
    return jsonify({
        "cache_size": len(VEHICLE_CACHE),
        "vehicle_hits": CACHE_STATS["vehicle_hits"],
        "vehicle_misses": CACHE_STATS["vehicle_misses"],
        "hit_ratio": f"{cache_hit_ratio:.1f}%",
        "token_requests": CACHE_STATS["token_requests"],
        "token_errors": CACHE_STATS["token_errors"],
        "vehicle_errors": CACHE_STATS["vehicle_errors"],
        "vehicle_403_count": CACHE_STATS["vehicle_403_count"],
        "rate_limit_requests": len(RATE_LIMIT["requests"]),
        "circuit_breaker_failures": CIRCUIT_BREAKER["failures"]
    })

@app.route("/metrics")
def metrics():
    """Expose metrics for monitoring"""
    failure_rate = STATS["failure"] / (STATS["success"] + STATS["failure"]) if (STATS["success"] + STATS["failure"]) > 0 else 0
    return f"""
    # HELP insurance_api_success Total successful requests
    # TYPE insurance_api_success counter
    insurance_api_success {STATS["success"]}
    # HELP insurance_api_failure Total failed requests
    # TYPE insurance_api_failure counter
    insurance_api_failure {STATS["failure"]}
    # HELP insurance_api_failure_rate Failure rate
    # TYPE insurance_api_failure_rate gauge
    insurance_api_failure_rate {failure_rate}
    """, 200, {"Content-Type": "text/plain"}

@app.route("/api/v1/vehicle/insurance/<registration>", methods=["GET"])
def check_insurance(registration):
    """Get vehicle insurance status by registration number"""
    check_memory_usage()
    if not registration:
        return jsonify({"status": "error", "errorMessage": "Registration number is required"}), 400
    registration = registration.upper().replace(" ", "")
    if not validate_vrm(registration):
        return jsonify({"status": "error", "errorMessage": "Invalid vehicle registration format"}), 400

    cache_key = f"insurance_{registration}"
    cached_data = get_cached_vehicle_data(cache_key)
    if cached_data:
        return jsonify(cached_data)

    try:
        token = get_access_token()
        # Pass the request context to the thread
        with app.app_context():
            future = executor.submit(check_vehicle_insurance_with_context, token, registration, request._get_current_object()) # Pass request context
        vehicle_data, is_insured = future.result(timeout=15)
        response = format_insurance_response(vehicle_data, is_insured, registration)
        update_vehicle_cache(cache_key, response)
        return jsonify(response)
    except Exception as e:
        status_code = 503 if "429" in str(e) else 500
        logger.error(f"Error checking insurance for {registration}: {str(e)}")
        return jsonify({
            "status": "error",
            "errorMessage": f"Temporary failure: {str(e)}" if status_code == 503 else str(e),
            "retryAfter": 60 if status_code == 503 else None
        }), status_code

@app.route("/api/v1/cache/clear", methods=["POST"])
def clear_cache():
    """Clear all caches (tokens and vehicle data)"""
    if CONFIG["INTERNAL_API_KEY"]:
        auth_header = request.headers.get("Authorization", "")
        if f"Bearer {CONFIG['INTERNAL_API_KEY']}" != auth_header:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
    global TOKEN_CACHE, VEHICLE_CACHE
    TOKEN_CACHE = {"access_token": None, "expires_at": 0}
    VEHICLE_CACHE.clear()
    logger.info("Cache cleared manually")
    return jsonify({"status": "success", "message": "Cache cleared successfully"})

# Error handling
@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "error", "errorMessage": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"status": "error", "errorMessage": "Internal server error"}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({"status": "error", "errorMessage": "An unexpected error occurred"}), 500

# Initialize the application
def init_app():
    """Initialize the application"""
    cleanup_timer = threading.Timer(300, cleanup_expired_cache)
    cleanup_timer.daemon = True
    cleanup_timer.start()
    logger.info("Background maintenance tasks started")

with app.app_context():
    init_app()

if __name__ == "__main__":
    import signal

    def handle_shutdown(signum, frame):
        logger.info("Received shutdown signal, stopping server")
        cleanup_expired_cache()
        executor.shutdown(wait=True)
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)

    logger.info(f"Starting Insurance API server on {CONFIG['HOST']}:{CONFIG['PORT']}")
    app.run(host=CONFIG["HOST"], port=CONFIG["PORT"], debug=CONFIG["DEBUG"])