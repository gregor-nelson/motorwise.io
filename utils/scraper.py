import pickle
import requests
import json
import time
import os
import re
from urllib.parse import unquote, urlparse, parse_qs
from datetime import datetime, timezone, timedelta
import jwt
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import logging
from bs4 import BeautifulSoup
import colorama
from colorama import Fore, Back, Style
import shutil
import sys

# Initialize colorama (required for Windows)
colorama.init(autoreset=True)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("fixes_scraper.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# API endpoint and parameters
BASE_URL = "https://workshop.autodata-group.com"
KNOWN_FIXES_BASE_URL = f"{BASE_URL}/w1/known-fixes"
VERSION = "c475fc2fee6cb3aa12c5a3c966dbcd39dfe4659c"
LANGUAGE = "en-gb"

# File paths for session storage
COOKIES_FILE = "session_cookies.json"
BROWSER_STATE_FILE = "browser_state.pkl"
USER_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "edge_user_data")

# Initial cookies (will be overridden by stored cookies if available)
COOKIES = {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZ25lbHNvbjU1NDUiLCJyb2xlcyI6WzgsMTIsMl0sImlzcyI6IndvcmtzaG9wIiwiZXhwIjoxNzQxODYxMDIyfQ.c2eantKyHFc4zarciDzrnxtVco6orcxtHYyGcv77jjY",
    "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIzNzM3MjU1IiwidW5hbWUiOiJnbmVsc29uNTU0NSIsImdpZCI6Ijc5MTk5MSIsImxhbmd1YWdlIjoiZW4tZ2IiLCJpc3MiOiJ3b3Jrc2hvcCIsImV4cCI6MTc0MTg3NDgyMn0.VZxyujsI5F2LXBUVRX5yPJx5h47ZlgbhPZ-TGws5gH0",
    "adat": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIzNzM3MjU1IiwidW5hbWUiOiJnbmVsc29uNTU0NSIsImdpZCI6Ijc5MTk5MSIsInJpZHMiOls2XSwiaXNzIjoid29ya3Nob3AiLCJleHAiOjE3NDE4NzQ4MTF9.RytKttiau67QRTrSX8tdRJxRFwmBsURrrLQ4nExvABs",
    "SESSd965b47fdd2684807fd560c91c3e21b6": "ksbP1jyrrtkgXoz5KsxviYp8qdyQfq2P1HDYM_vxj60"
}

COOKIE_EXPIRATIONS = {
    "access_token": datetime(2025, 3, 13, 10, 17, 3, 143000, tzinfo=timezone.utc),
    "id_token": datetime(2025, 3, 13, 14, 7, 3, 143000, tzinfo=timezone.utc),
    "adat": datetime(2025, 3, 13, 14, 6, 52, 684000, tzinfo=timezone.utc),
    "SESSd965b47fdd2684807fd560c91c3e21b6": datetime(2025, 4, 5, 13, 40, 12, 684000, tzinfo=timezone.utc)
}

HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0",
    "xhr-request-from": "workshop"
}

# Login credentials and form details
LOGIN_URL = "https://workshop.autodata-group.com/login?destination=node"
USERNAME = "gnelson5545"
PASSWORD = "Lesmurdie12££$$"
USERNAME_FIELD_ID = "edit-name"
PASSWORD_FIELD_ID = "edit-pass"
SUBMIT_BUTTON_ID = "edit-submit"
POST_LOGIN_CHECK = "workshop.autodata-group.com"

# UI Enhancement Functions
def print_header():
    """Print a styled header for the application"""
    terminal_width = shutil.get_terminal_size().columns
    header = "AUTODATA KNOWN FIXES SCRAPER"
    
    print("\n" + "=" * terminal_width)
    print(Fore.CYAN + Style.BRIGHT + header.center(terminal_width))
    print("=" * terminal_width + "\n")

def print_status(message, status_type="info"):
    """Print a status message with appropriate coloring"""
    if status_type == "info":
        print(Fore.BLUE + f"[INFO] {message}")
    elif status_type == "success":
        print(Fore.GREEN + f"[SUCCESS] {message}")
    elif status_type == "warning":
        print(Fore.YELLOW + f"[WARNING] {message}")
    elif status_type == "error":
        print(Fore.RED + f"[ERROR] {message}")
    else:
        print(message)

# Basic functionality
def load_cookies():
    """Load cookies from a file if available"""
    if os.path.exists(COOKIES_FILE):
        try:
            with open(COOKIES_FILE, 'r') as f:
                data = json.load(f)
                cookies = data.get('cookies', {})
                expirations = data.get('expirations', {})
                
                # Convert expiration strings back to datetime objects
                for key, value in expirations.items():
                    expirations[key] = datetime.fromisoformat(value)
                
                logger.info("Loaded cookies from file")
                return cookies, expirations
        except Exception as e:
            logger.error(f"Error loading cookies from file: {str(e)}")
    
    logger.info("No saved cookies found or error loading them")
    return None, None

def save_cookies(cookies, expirations):
    """Save cookies to a file for reuse"""
    try:
        # Convert datetime objects to ISO format strings for JSON serialization
        serializable_expirations = {k: v.isoformat() for k, v in expirations.items()}
        
        data = {
            'cookies': cookies,
            'expirations': serializable_expirations,
            'saved_at': datetime.now(timezone.utc).isoformat()
        }
        
        with open(COOKIES_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info("Saved cookies to file")
        return True
    except Exception as e:
        logger.error(f"Error saving cookies to file: {str(e)}")
        return False

def extract_vehicle_details_from_html(html_content):
    """Extract vehicle make, model, and engine details from HTML content"""
    if not html_content:
        return None
    
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Look for the print-vehicle-details section
        vehicle_details_div = soup.find("div", class_="print-vehicle-details")
        if not vehicle_details_div:
            logger.warning("Could not find vehicle details section in HTML")
            return None
        
        details = {}
        
        # Extract the title if available
        title_element = vehicle_details_div.find("h1", class_="header-title")
        if title_element:
            details["page_title"] = title_element.get_text().strip()
        
        # Extract make and model
        make_model_element = vehicle_details_div.find("li", class_="print-manufacturer-model")
        if make_model_element:
            # Strip out the "Vehicle details:" text if present
            details_span = make_model_element.find("span", class_="details")
            if details_span:
                details_span.extract()  # Remove the span to get clean text
            
            make_model_text = make_model_element.get_text().strip()
            details["make_model"] = make_model_text
            
            # Try to separate make and model if possible
            # This is a simple approach and might need refinement for different formats
            if " " in make_model_text:
                parts = make_model_text.split(" ", 1)
                details["make"] = parts[0].strip()
                details["model"] = parts[1].strip()
            else:
                details["make"] = make_model_text
                details["model"] = ""
        
        # Extract other details like engine info
        other_details_element = vehicle_details_div.find("li", class_="print-other-details")
        if other_details_element:
            details["engine_info"] = other_details_element.get_text().strip()
        
        # If we couldn't extract details directly, look for job-folder information
        if not details.get("make_model"):
            job_folder = soup.find("div", class_="job-folder")
            if job_folder:
                manufacturer_element = job_folder.find("li", class_="displayManufacturer")
                model_element = job_folder.find("li", class_="displayModel")
                engine_element = job_folder.find("li", class_="engine-size")
                
                if manufacturer_element:
                    details["make"] = manufacturer_element.get_text().strip()
                
                if model_element:
                    details["model"] = model_element.get_text().strip()
                
                if details.get("make") and details.get("model"):
                    details["make_model"] = f"{details['make']} {details['model']}".strip()
                
                if engine_element:
                    details["engine_info"] = engine_element.get_text().strip()
        
        return details if details else None
    
    except Exception as e:
        logger.error(f"Error extracting vehicle details from HTML: {str(e)}")
        return None

def create_descriptive_folder_name(vehicle_id, vehicle_details=None):
    """Create a descriptive and file-system safe folder name from vehicle details"""
    if not vehicle_details:
        return vehicle_id
    
    # Start with make and model if available
    folder_name_parts = []
    
    if vehicle_details.get("make_model"):
        folder_name_parts.append(vehicle_details["make_model"])
    elif vehicle_details.get("make") and vehicle_details.get("model"):
        folder_name_parts.append(f"{vehicle_details['make']} {vehicle_details['model']}")
    
    # Add engine info if available
    if vehicle_details.get("engine_info"):
        folder_name_parts.append(vehicle_details["engine_info"])
    
    # Always include the vehicle ID for reference
    folder_name_parts.append(f"ID-{vehicle_id}")
    
    # Join parts and sanitize folder name
    folder_name = " - ".join(folder_name_parts)
    
    # Replace characters that are problematic in file systems
    folder_name = re.sub(r'[\\/*?:"<>|]', '_', folder_name)  # Remove illegal filename chars
    folder_name = re.sub(r'\s+', ' ', folder_name)  # Replace multiple spaces with single
    folder_name = folder_name.strip()
    
    # If folder name is too long, truncate it
    if len(folder_name) > 120:  # Leaving some margin below 255 char limit
        folder_name = folder_name[:117] + "..."
    
    return folder_name

def create_directories(vehicle_id=None, vehicle_details=None):
    """Create directories for saving files"""
    main_dir = "all_fixes"
    detail_dir = "fix_details"
    
    os.makedirs(main_dir, exist_ok=True)
    os.makedirs(detail_dir, exist_ok=True)
    os.makedirs(USER_DATA_DIR, exist_ok=True)
    
    # Create vehicle-specific subfolders if a vehicle ID is provided
    if vehicle_id:
        # Create descriptive folder name if details are available
        folder_name = create_descriptive_folder_name(vehicle_id, vehicle_details)
        
        # Create folders with descriptive names
        vehicle_main_dir = os.path.join(main_dir, folder_name)
        vehicle_detail_dir = os.path.join(detail_dir, folder_name)
        
        os.makedirs(vehicle_main_dir, exist_ok=True)
        os.makedirs(vehicle_detail_dir, exist_ok=True)
        
        logger.info(f"Created vehicle-specific directories with name: {folder_name}")
        print_status(f"Created directories for: {folder_name}", "success")
        
        return vehicle_main_dir, vehicle_detail_dir
    
    logger.info(f"Created base directories: {main_dir}, {detail_dir}, and {USER_DATA_DIR}")
    return main_dir, detail_dir

def refresh_cookies():
    """Log in with Selenium using Microsoft Edge to fetch fresh cookies"""
    logger.info("Starting cookie refresh via login with Microsoft Edge")
    print_status("Starting cookie refresh via login with Microsoft Edge", "info")
    
    options = webdriver.EdgeOptions()
    # Set user data directory to maintain session across runs
    options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    # Add argument to disable "already signed in" prompts
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    
    # Check if we have a stored browser state
    if os.path.exists(BROWSER_STATE_FILE):
        try:
            logger.debug("Attempting to load stored browser state")
            with open(BROWSER_STATE_FILE, 'rb') as f:
                state = pickle.load(f)
                # Use any relevant state data if needed
        except Exception as e:
            logger.error(f"Error loading browser state: {str(e)}")
    
    driver = webdriver.Edge(service=Service(EdgeChromiumDriverManager().install()), options=options)

    try:
        # First check if we're already logged in by visiting the base URL
        logger.debug("Checking if already logged in")
        print_status("Checking if already logged in...", "info")
        driver.get(BASE_URL)
        time.sleep(2)
        
        # If we're on a login page, perform login
        if "login" in driver.current_url.lower():
            logger.debug(f"Not logged in. Navigating to login URL: {LOGIN_URL}")
            print_status("Not logged in. Performing login...", "info")
            driver.get(LOGIN_URL)
            time.sleep(2)
            logger.debug("Login page loaded")

            logger.debug(f"Entering username: {USERNAME}")
            driver.find_element(By.ID, USERNAME_FIELD_ID).send_keys(USERNAME)
            logger.debug("Entering password")
            driver.find_element(By.ID, PASSWORD_FIELD_ID).send_keys(PASSWORD)
            logger.debug("Submitting login form")
            driver.find_element(By.ID, SUBMIT_BUTTON_ID).click()

            logger.debug("Waiting for redirect")
            WebDriverWait(driver, 15).until(
                lambda d: d.current_url != LOGIN_URL,
                "Login redirect timed out"
            )
        
        current_url = driver.current_url
        logger.debug(f"Current URL after login check: {current_url}")
        if POST_LOGIN_CHECK not in current_url:
            logger.warning(f"Login may have failed. Expected URL containing '{POST_LOGIN_CHECK}', got: {current_url}")
            print_status("Login may have failed", "warning")
            return None

        logger.debug("Extracting cookies from browser")
        print_status("Extracting cookies from browser", "info")
        new_cookies = {}
        for cookie in driver.get_cookies():
            name = cookie["name"]
            value = cookie["value"]
            new_cookies[name] = value
            if "expiry" in cookie:
                expiry = datetime.fromtimestamp(cookie["expiry"], tz=timezone.utc)
                COOKIE_EXPIRATIONS[name] = expiry
                logger.debug(f"Cookie {name} expires at {expiry}")
            elif name in ["access_token", "id_token", "adat"]:
                COOKIE_EXPIRATIONS[name] = datetime.now(timezone.utc) + timedelta(hours=4)
                logger.debug(f"Cookie {name} assigned 4-hour expiry")
            elif name.startswith("SESS"):
                COOKIE_EXPIRATIONS[name] = datetime.now(timezone.utc) + timedelta(weeks=3)
                logger.debug(f"Cookie {name} assigned 3-week expiry")

        required = ["access_token", "id_token"]
        if not all(k in new_cookies for k in required):
            missing = ', '.join(set(required) - set(new_cookies.keys()))
            logger.error(f"Missing required cookies: {missing}")
            print_status(f"Missing required cookies: {missing}", "error")
            return None

        # Save the browser state
        try:
            logger.debug("Saving browser state")
            with open(BROWSER_STATE_FILE, 'wb') as f:
                pickle.dump({
                    'timestamp': datetime.now(timezone.utc),
                    'session_id': driver.session_id
                }, f)
        except Exception as e:
            logger.error(f"Error saving browser state: {str(e)}")
        
        # Save cookies to file for future use
        save_cookies(new_cookies, COOKIE_EXPIRATIONS)
        
        logger.info("Cookies refreshed successfully")
        print_status("Cookies refreshed successfully", "success")
        logger.debug(f"New cookies: {json.dumps(new_cookies, indent=2)}")
        return new_cookies
    except Exception as e:
        logger.error(f"Error refreshing cookies: {str(e)}", exc_info=True)
        print_status(f"Error refreshing cookies: {str(e)}", "error")
        return None
    finally:
        driver.quit()
        logger.debug("Selenium driver closed")

def check_token_expiry(token, token_name, browser_expiry):
    now = datetime.now(timezone.utc)
    logger.debug(f"Checking expiry for {token_name}, browser expiry: {browser_expiry}")
    if now >= browser_expiry:
        logger.warning(f"{token_name} browser cookie expired on {browser_expiry}")
        return False
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp = decoded.get("exp")
        if exp:
            jwt_expiry = datetime.fromtimestamp(exp, tz=timezone.utc)
            logger.debug(f"{token_name} JWT expiry: {jwt_expiry}")
            if now >= jwt_expiry:
                logger.warning(f"{token_name} JWT expired on {jwt_expiry}")
                return False
        else:
            logger.debug(f"{token_name} has no JWT expiry field")
        return True
    except jwt.InvalidTokenError:
        logger.error(f"{token_name} is invalid or malformed")
        return False

def validate_tokens(cookies):
    """Validate authentication tokens, load from file or refresh if needed"""
    global COOKIE_EXPIRATIONS
    
    print_status("Validating authentication tokens", "info")
    logger.info("Validating authentication tokens")
    
    # First attempt to load cookies from file
    saved_cookies, saved_expirations = load_cookies()
    if saved_cookies and saved_expirations:
        cookies = saved_cookies
        COOKIE_EXPIRATIONS = saved_expirations
        logger.info("Using saved cookies from file")
        print_status("Using saved cookies from file", "info")
    
    required_tokens = ["access_token", "id_token"]
    all_valid = True
    for token_name in required_tokens:
        token = cookies.get(token_name)
        if not token:
            logger.error(f"{token_name} missing from cookies")
            all_valid = False
        elif not check_token_expiry(token, token_name, COOKIE_EXPIRATIONS.get(token_name, datetime.now(timezone.utc))):
            all_valid = False
        else:
            logger.debug(f"{token_name} is valid")
    
    if not all_valid:
        logger.info("One or more tokens invalid or expired, refreshing cookies")
        print_status("One or more tokens invalid or expired, refreshing cookies", "warning")
        new_cookies = refresh_cookies()
        if new_cookies:
            save_cookies(new_cookies, COOKIE_EXPIRATIONS)
            return new_cookies
        else:
            logger.error("Failed to refresh cookies")
            print_status("Failed to refresh cookies", "error")
            return None
    
    logger.info("All required tokens are valid")
    print_status("All required tokens are valid", "success")
    return cookies

def test_authentication(cookies):
    """Test if the current cookies allow access to API"""
    # Use the base URL instead of known-fixes to check authentication
    url = BASE_URL
    logger.debug("Testing authentication with current cookies")
    
    try:
        response = requests.get(url, headers=HEADERS, cookies=cookies, timeout=10, allow_redirects=False)
        
        # If authentication is valid, we should get a 200 status code
        # If invalid, we will get a redirect to login page (302)
        if response.status_code == 200:
            logger.info("Authentication test successful")
            return True
        elif response.status_code == 302:
            location = response.headers.get('Location', '')
            if 'login' in location:
                logger.warning("Authentication test failed - redirected to login page")
                return False
        
        logger.warning(f"Authentication test returned unexpected status code: {response.status_code}")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error testing authentication: {str(e)}")
        return False

def direct_model_selection_interactive(cookies):
    """Open a browser to the home page and let the user navigate to known fixes section"""
    logger.info("Opening browser for interactive navigation")
    print_status("Opening browser for vehicle selection...", "info")
    
    options = webdriver.EdgeOptions()
    options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    
    driver = None
    try:
        driver = webdriver.Edge(service=Service(EdgeChromiumDriverManager().install()), options=options)
        
        # Navigate to the base URL (home page) instead of directly to known fixes
        url = BASE_URL
        logger.debug(f"Navigating to {url}")
        print_status(f"Navigating to {url}", "info")
        driver.get(url)
        time.sleep(2)  # Allow time for page to load
        
        # Display instructions to the user
        print()
        print(Fore.YELLOW + "=" * 75)
        print(Fore.YELLOW + "  MANUAL NAVIGATION INSTRUCTIONS")
        print(Fore.YELLOW + "=" * 75)
        print(Fore.GREEN + "  1. Use the browser window that just opened")
        print(Fore.GREEN + "  2. Navigate to the 'Known Fixes' section (usually in the main menu)")
        print(Fore.GREEN + "  3. Select the vehicle manufacturer, model, etc. when prompted")
        print(Fore.GREEN + "  4. Navigate to the specific Known Fixes page for your selected vehicle") 
        print(Fore.GREEN + "  5. Once you're on the Known Fixes page with a list of fixes for your vehicle")
        print()
        print(Fore.CYAN + "  NOTE: " + Style.BRIGHT + "Take as much time as you need to find your vehicle.")
        print(Fore.CYAN + "        There is NO TIMEOUT for this step.")
        print(Fore.CYAN + "        The script will wait until you press Enter to continue.")
        print(Fore.YELLOW + "=" * 75)
        print()
        
        # Wait for user to confirm they've selected the model and reached the fixes page
        print(Fore.GREEN + "Take your time to find and navigate to the correct vehicle..." + Style.RESET_ALL)
        print(Fore.GREEN + "The script will wait indefinitely until you're ready." + Style.RESET_ALL)
        user_input = input(Fore.YELLOW + Style.BRIGHT + "Press Enter ONLY when you've reached the Known Fixes page with your desired vehicle: " + Style.RESET_ALL)
        
        # Get the current URL and page content after selection
        current_url = driver.current_url
        logger.info(f"User confirmed selection, current URL: {current_url}")
        print_status(f"Current URL: {current_url}", "info")
        
        # Extract vehicle ID from URL
        vehicle_id = extract_vehicle_id_from_url(current_url)
        if not vehicle_id:
            # Try to find it in the page content
            page_content = driver.page_source
            vehicle_id = extract_vehicle_id_from_content(page_content, current_url)
        
        if vehicle_id:
            logger.info(f"Extracted vehicle ID: {vehicle_id}")
            print_status(f"Detected vehicle ID: {vehicle_id}", "success")
        else:
            logger.warning("Could not extract vehicle ID from URL or content")
            print_status("Could not detect vehicle ID. Using generic identifier.", "warning")
            vehicle_id = f"vehicle_{int(time.time())}"
        
        # Update cookies after selection
        new_cookies = {}
        for cookie in driver.get_cookies():
            name = cookie["name"]
            value = cookie["value"]
            new_cookies[name] = value
            if "expiry" in cookie:
                expiry = datetime.fromtimestamp(cookie["expiry"], tz=timezone.utc)
                COOKIE_EXPIRATIONS[name] = expiry
        
        # Update global cookies with any new ones
        global COOKIES
        COOKIES.update(new_cookies)
        save_cookies(COOKIES, COOKIE_EXPIRATIONS)
        
        # Return the vehicle ID and page content
        return vehicle_id, driver.page_source, current_url
    except Exception as e:
        logger.error(f"Error in interactive navigation: {str(e)}", exc_info=True)
        print_status(f"Error in browser navigation: {str(e)}", "error")
        return None, None, None
    finally:
        if driver:
            driver.quit()
            logger.debug("Selenium driver closed")

def extract_vehicle_id_from_url(url):
    """Extract the vehicle ID from a URL"""
    if not url:
        return None
    
    # Try to find pattern like /w1/known-fixes/HON12345 in the URL
    patterns = [
        r'/known-fixes/([A-Z]{3}\d+)',  # matches /known-fixes/HON12345
        r'/([A-Z]{3}\d+)/known-fixes',  # matches /HON12345/known-fixes
        r'vehicle=([A-Z]{3}\d+)'        # matches vehicle=HON12345 in query params
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            vehicle_id = match.group(1)
            # Clean the vehicle ID to ensure it's valid for folder names
            clean_vehicle_id = re.sub(r'[^\w\-]', '_', vehicle_id)
            return clean_vehicle_id
    
    # If no match found, try parsing the path segments
    try:
        parsed_url = urlparse(url)
        path_segments = parsed_url.path.split('/')
        
        # Look for a segment that matches the pattern of a vehicle ID
        for segment in path_segments:
            if re.match(r'^[A-Z]{3}\d+$', segment):
                # Clean the vehicle ID to ensure it's valid for folder names
                clean_vehicle_id = re.sub(r'[^\w\-]', '_', segment)
                return clean_vehicle_id
    except Exception as e:
        logger.error(f"Error parsing URL {url}: {str(e)}")
    
    return None

def extract_vehicle_id_from_content(html_content, url):
    """Try to extract vehicle ID from page content if URL extraction failed"""
    if not html_content:
        return None
    
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Look for vehicle ID in various elements
        # Search in breadcrumbs
        breadcrumbs = soup.find_all(class_=["breadcrumb", "breadcrumbs", "path", "navigation"])
        for breadcrumb in breadcrumbs:
            text = breadcrumb.get_text()
            match = re.search(r'([A-Z]{3}\d+)', text)
            if match:
                vehicle_id = match.group(1)
                # Clean the vehicle ID to ensure it's valid for folder names
                return re.sub(r'[^\w\-]', '_', vehicle_id)
        
        # Look in title elements
        titles = soup.find_all(["h1", "h2", "title"])
        for title in titles:
            text = title.get_text()
            match = re.search(r'([A-Z]{3}\d+)', text)
            if match:
                vehicle_id = match.group(1)
                # Clean the vehicle ID to ensure it's valid for folder names
                return re.sub(r'[^\w\-]', '_', vehicle_id)
        
        # Try finding it in any element with data attributes
        for element in soup.find_all(attrs={"data-vehicle": True}):
            data_vehicle = element.get("data-vehicle")
            if re.match(r'^[A-Z]{3}\d+$', data_vehicle):
                # Clean the vehicle ID to ensure it's valid for folder names
                return re.sub(r'[^\w\-]', '_', data_vehicle)
        
        # Look for any text that matches the vehicle ID pattern
        for tag in soup.find_all(string=True):
            match = re.search(r'([A-Z]{3}\d+)', tag)
            if match:
                vehicle_id = match.group(1)
                # Clean the vehicle ID to ensure it's valid for folder names
                return re.sub(r'[^\w\-]', '_', vehicle_id)
        
        # As a last resort, generate from URL
        if url:
            path = urlparse(url).path
            if "/known-fixes/" in path:
                # Extract the part after /known-fixes/
                segment = path.split('/known-fixes/')[1].split('/')[0]
                # Clean the segment to ensure it's valid for folder names
                pattern = r'[^\w-]'  # Notice the dash doesn't need escaping at the end
                return f"vehicle_{re.sub(pattern, '_', segment)}"
    except Exception as e:
        logger.error(f"Error extracting vehicle ID from content: {str(e)}")
    
    return None

def save_html_content(content, filename, directory):
    """Save HTML content to a file"""
    if not content:
        logger.warning(f"No content to save for {filename}")
        return False
    
    try:
        filepath = os.path.join(directory, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        logger.info(f"Content saved to {filepath}")
        return True
    except Exception as e:
        logger.error(f"Failed to save content to {filename}: {str(e)}")
        return False

def extract_known_fix_links(html_content, vehicle_id, current_url):
    """Extract links to known fixes from the HTML content"""
    if not html_content:
        logger.warning(f"No HTML content to parse for {vehicle_id}")
        return []
    
    links = []
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Debug the overall structure
        logger.debug(f"Analyzing HTML structure for vehicle {vehicle_id}")
        
        # Look for fix detail links in the HTML
        for link in soup.find_all("a", href=True):
            href = link["href"]
            link_text = link.get_text().strip()
            
            # Check for various patterns of fix links
            if (f"/known-fixes/{vehicle_id}/" in href or 
                f"known-fixes/{vehicle_id}/" in href or 
                f"/{vehicle_id}/" in href and "/known-fixes/" in href or
                "/known-fixes/" in href and "fix" in href.lower()):
                
                logger.debug(f"Found potential fix link: {href} | Text: {link_text}")
                
                # Ensure we have the full URL
                if not href.startswith("http"):
                    # Handle relative URLs
                    if href.startswith("/"):
                        href = f"{BASE_URL}{href}"
                    # Handle relative to current path
                    elif href.startswith("./") or not href.startswith("/"):
                        base_path = "/".join(current_url.split("/")[:-1])
                        href = f"{base_path}/{href.lstrip('./')}"
                    else:
                        href = f"{BASE_URL}/{href}"
                
                links.append(href)
        
        # Try looking for table rows with data-url attributes
        for row in soup.find_all(attrs={"data-url": True}):
            data_url = row.get("data-url")
            if "known-fixes" in data_url:
                # Ensure we have the full URL
                href = data_url
                if not href.startswith("http"):
                    href = f"{BASE_URL}{href}" if href.startswith("/") else f"{BASE_URL}/{href}"
                logger.debug(f"Found fix link in data-url: {href}")
                links.append(href)
        
        # Look for links in other potential containers
        for container in soup.find_all(["div", "article", "section", "table"]):
            # Look for any links inside these containers
            for link in container.find_all("a", href=True):
                href = link["href"]
                # Check if it looks like a fix link
                if "/known-fixes/" in href:
                    # Ensure we have the full URL
                    if not href.startswith("http"):
                        href = f"{BASE_URL}{href}" if href.startswith("/") else f"{BASE_URL}/{href}"
                    logger.debug(f"Found fix link in container: {href}")
                    links.append(href)
        
        # Remove duplicates while preserving order
        unique_links = []
        for link in links:
            if link not in unique_links:
                unique_links.append(link)
        
        # Log all found links
        if unique_links:
            logger.info(f"Found {len(unique_links)} known fix links for {vehicle_id}")
            for i, link in enumerate(unique_links):
                logger.debug(f"Fix #{i+1}: {link}")
        else:
            logger.warning(f"No fix links found for {vehicle_id}. Check HTML structure.")
            print_status(f"No fix links found for {vehicle_id}. The page may not contain any fixes.", "warning")
            # Save HTML for debugging
            debug_filename = f"debug_{vehicle_id}_no_links.html"
            with open(debug_filename, "w", encoding="utf-8") as f:
                f.write(html_content)
            logger.debug(f"Saved debug HTML to {debug_filename}")
            print_status(f"Saved debug HTML to {debug_filename} for inspection", "info")
        
        return unique_links
    except Exception as e:
        logger.error(f"Error extracting known fix links for {vehicle_id}: {str(e)}", exc_info=True)
        return []

def parse_title_from_url(url, vehicle_details=None):
    """Extract a clean title from the URL for filename creation"""
    try:
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)
        
        # First try using the title parameter in the URL
        if "title" in query_params:
            raw_title = query_params["title"][0]
            # Decode URL-encoded characters
            decoded_title = unquote(raw_title)
            # Replace special characters with underscores
            clean_title = re.sub(r'[^\w\s-]', '_', decoded_title)
            # Replace spaces with underscores
            clean_title = re.sub(r'\s+', '_', clean_title).lower()
            # Trim long filenames
            if len(clean_title) > 100:
                clean_title = clean_title[:100]
            
            # Extract vehicle ID from URL for better organization
            url_parts = url.split('/')
            vehicle_id = next((part for part in url_parts if re.match(r'^[A-Z]{3}\d+$', part)), "unknown")
            
            # If we have vehicle details, add make/model to the filename
            prefix = ""
            if vehicle_details and vehicle_details.get("make"):
                make = re.sub(r'[^\w\s-]', '_', vehicle_details["make"]).lower()
                prefix = f"{make}_"
            
            return f"{prefix}{vehicle_id}_{clean_title}"
        
        # If no title, use the path portion and add descriptive information if available
        path_parts = parsed_url.path.split('/')
        vehicle_id = next((part for part in path_parts if re.match(r'^[A-Z]{3}\d+$', part)), "unknown")
        fix_id = path_parts[-1] if path_parts[-1].isdigit() else "unknown"
        
        # If we have vehicle details, add make/model to the filename
        prefix = ""
        if vehicle_details and vehicle_details.get("make"):
            make = re.sub(r'[^\w\s-]', '_', vehicle_details["make"]).lower()
            prefix = f"{make}_"
            
        return f"{prefix}{vehicle_id}_fix_{fix_id}"
    except Exception as e:
        logger.error(f"Error parsing title from URL {url}: {str(e)}")
        # Return a fallback filename with timestamp
        return f"unknown_fix_{int(time.time())}"

def fetch_and_save_fix_detail(url, cookies, detail_dir, vehicle_details=None):
    """Fetch and save the detailed page for a known fix"""
    logger.debug(f"Fetching fix detail from {url}")
    
    try:
        response = requests.get(url, headers=HEADERS, cookies=cookies, timeout=10)
        response.raise_for_status()
        
        # Verify this looks like a fix detail page (simple check)
        if "known-fixes" not in url or len(response.text) < 1000:
            logger.warning(f"URL {url} may not be a valid fix detail page (content too short)")
        
        # Generate filename from URL with descriptive elements if available
        title = parse_title_from_url(url, vehicle_details)
        filename = f"{title}.html"
        
        # Save the content
        save_html_content(response.text, filename, detail_dir)
        logger.info(f"Successfully saved fix detail: {filename}")
        print_status(f"Saved fix detail: {filename}", "success")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching fix detail from {url}: {str(e)}")
        print_status(f"Error fetching fix detail: {url}", "error")
        if e.response and e.response.status_code == 401:
            logger.warning("Authentication failed, likely due to expired tokens")
        elif e.response and e.response.status_code == 404:
            logger.warning(f"Page not found (404) for URL: {url}")
        return False

def process_vehicle():
    """Process a single vehicle's fixes"""
    global COOKIES
    
    # Start direct interactive model selection (opens browser)
    vehicle_id, html_content, current_url = direct_model_selection_interactive(COOKIES)
    
    if not vehicle_id or not html_content:
        print_status("Failed to get vehicle information or page content", "error")
        return False
    
    # Extract vehicle details from HTML for better folder naming
    vehicle_details = extract_vehicle_details_from_html(html_content)
    if vehicle_details:
        print_status(f"Detected vehicle: {vehicle_details.get('make_model', 'Unknown')} {vehicle_details.get('engine_info', '')}", "info")
    else:
        print_status("Could not extract detailed vehicle information from page", "warning")
    
    # Create vehicle-specific directories with descriptive names
    vehicle_main_dir, vehicle_detail_dir = create_directories(vehicle_id, vehicle_details)
    print_status(f"Saving files to vehicle-specific folders", "info")
    
    # Save the main fixes page
    main_filename = f"{vehicle_id}_fixes_main.html"
    save_html_content(html_content, main_filename, vehicle_main_dir)
    
    # Extract links to individual fixes
    fix_links = extract_known_fix_links(html_content, vehicle_id, current_url)
    total_fixes = len(fix_links)
    
    if total_fixes > 0:
        print_status(f"Found {total_fixes} fix(es) for {vehicle_id}", "success")
        
        # Process each fix link with progress indicator
        for fix_idx, link in enumerate(fix_links):
            print_status(f"Processing fix {fix_idx+1}/{total_fixes}: {link}", "info")
            success = fetch_and_save_fix_detail(link, COOKIES, vehicle_detail_dir, vehicle_details)
            
            if success:
                print_status(f"Saved fix {fix_idx+1}/{total_fixes} to {vehicle_detail_dir}", "success")
            else:
                print_status(f"Failed to fetch {link}, checking tokens", "warning")
                COOKIES = validate_tokens(COOKIES)
                if not COOKIES:
                    print_status("Failed to refresh cookies, stopping", "error")
                    break
                # Try again with fresh cookies
                if fetch_and_save_fix_detail(link, COOKIES, vehicle_detail_dir, vehicle_details):
                    print_status(f"Retry successful for fix {fix_idx+1}", "success")
            
            # Add a small delay between requests
            time.sleep(0.5)
    else:
        print_status(f"No fixes found for {vehicle_id}", "warning")

    # Save vehicle details to a JSON file for reference
    if vehicle_details:
        try:
            details_filename = f"{vehicle_id}_vehicle_details.json"
            details_path = os.path.join(vehicle_main_dir, details_filename)
            with open(details_path, 'w', encoding='utf-8') as f:
                json.dump(vehicle_details, f, indent=2)
            print_status(f"Saved vehicle details to {details_filename}", "info")
        except Exception as e:
            logger.error(f"Failed to save vehicle details: {str(e)}")
    
    return True

def main():
    global COOKIES
    
    # Show application header
    print_header()
    
    print_status("Starting known fixes scraping script", "info")
    logger.info("Starting known fixes scraping script")
    
    # Create base output directories (without vehicle ID)
    base_main_dir, base_detail_dir = create_directories()
    
    # Validate tokens
    COOKIES = validate_tokens(COOKIES)
    if not COOKIES:
        print_status("Failed to initialize cookies, exiting", "error")
        return

    # Main program loop
    continue_scraping = True
    
    while continue_scraping:
        # Process a single vehicle
        success = process_vehicle()
        
        if not success:
            print_status("Error processing vehicle", "error")
        
        # Ask the user if they want to process another vehicle
        print("\n" + "=" * shutil.get_terminal_size().columns)
        print(Fore.CYAN + Style.BRIGHT + "Vehicle processing completed".center(shutil.get_terminal_size().columns))
        print("=" * shutil.get_terminal_size().columns + "\n")
        
        # Prompt user to continue or exit
        while True:
            user_choice = input(Fore.YELLOW + Style.BRIGHT + "Do you want to process another vehicle? (Y/N): " + Style.RESET_ALL).strip().lower()
            if user_choice in ['y', 'yes']:
                print_status("Continuing to next vehicle...", "info")
                # Validate tokens again before processing the next vehicle
                COOKIES = validate_tokens(COOKIES)
                if not COOKIES:
                    print_status("Failed to refresh cookies, exiting", "error")
                    continue_scraping = False
                break
            elif user_choice in ['n', 'no']:
                print_status("Exiting scraper", "info")
                continue_scraping = False
                break
            else:
                print_status("Please enter 'Y' or 'N'", "warning")
    
    print_status("Scraping session completed", "success")
    print("\n" + "=" * shutil.get_terminal_size().columns + "\n")

if __name__ == "__main__":
    main()