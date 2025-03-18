import requests
import json
import time
from datetime import datetime, timezone, timedelta
import jwt
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("oil_scraper.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# API endpoint and parameters
BASE_URL = "https://workshop.autodata-group.com/w2/api/engine-oil/{}"
VERSION = "c475fc2fee6cb3aa12c5a3c966dbcd39dfe4659c"
LANGUAGE = "en-gb"
DEFAULT_START_ID = 13364
DEFAULT_END_ID = 13366

# Initial cookies
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
    "accept": "application/json",
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

def refresh_cookies():
    """Log in with Selenium using Microsoft Edge to fetch fresh cookies (non-headless for testing)."""
    logger.info("Starting cookie refresh via login with Microsoft Edge")
    options = webdriver.EdgeOptions()
    # Headless mode disabled for debugging (re-enable later if desired)
    # options.add_argument("--headless")
    driver = webdriver.Edge(service=Service(EdgeChromiumDriverManager().install()), options=options)

    try:
        logger.debug(f"Navigating to login URL: {LOGIN_URL}")
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
        logger.debug(f"Current URL after login: {current_url}")
        if POST_LOGIN_CHECK not in current_url:
            logger.warning(f"Login may have failed. Expected redirect containing '{POST_LOGIN_CHECK}', got: {current_url}")
            return None

        logger.debug("Extracting cookies from browser")
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
            logger.error(f"Missing required cookies: {', '.join(set(required) - set(new_cookies.keys()))}")
            return None

        logger.info("Cookies refreshed successfully")
        logger.debug(f"New cookies: {json.dumps(new_cookies, indent=2)}")
        return new_cookies
    except Exception as e:
        logger.error(f"Error refreshing cookies: {str(e)}", exc_info=True)
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
    logger.info("Validating authentication tokens")
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
        return refresh_cookies()
    logger.info("All required tokens are valid")
    return cookies

def fetch_oil_data(vehicle_id, cookies):
    url = BASE_URL.format(vehicle_id)
    params = {"v": VERSION, "language": LANGUAGE}
    logger.debug(f"Fetching data for {vehicle_id} from {url} with params {params}")
    logger.debug(f"Using cookies: {json.dumps({k: v[:20] + '...' for k, v in cookies.items()}, indent=2)}")
    try:
        response = requests.get(url, headers=HEADERS, cookies=cookies, params=params, timeout=10)
        response.raise_for_status()
        logger.info(f"Successfully fetched data for {vehicle_id}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching {vehicle_id}: {str(e)}")
        if e.response and e.response.status_code == 401:
            logger.warning("Authentication failed, likely due to expired tokens")
        return None

def extract_oil_info(data, vehicle_id):
    if not data:
        logger.warning(f"No data retrieved for {vehicle_id}")
        return {"vehicle_id": vehicle_id, "error": "No data retrieved"}
    result = {
        "vehicle_id": vehicle_id,
        "engine_capacity": f"{data.get('engine_capacity', {}).get('value', 'N/A')} {data.get('engine_capacity', {}).get('unit', '')}",
        "capacity_description": data.get("engine_capacity", {}).get("description", "N/A"),
        "tightening_torques": [{"description": t.get("description", "N/A"), "value": t.get("value", "N/A")} for t in data.get("tightening_torques", [])],
        "engine_oils": [
            {
                "temperature": oil.get("temperature", {}).get("value", "N/A"),
                "grades": [g.get("value") for g in oil.get("grades", [])],
                "classifications": [c.get("value") for c in oil.get("classifications", [])]
            }
            for oil in data.get("engine_oils", [])
        ]
    }
    logger.debug(f"Extracted data for {vehicle_id}: {json.dumps(result, indent=2)}")
    return result

def save_to_file(data_list, filename="oil_data.json"):
    logger.info(f"Saving {len(data_list)} records to {filename}")
    try:
        with open(filename, "w") as f:
            json.dump(data_list, f, indent=2)
        logger.info(f"Data successfully saved to {filename}")
    except Exception as e:
        logger.error(f"Failed to save data to {filename}: {str(e)}")

def main():
    global COOKIES
    logger.info("Starting oil data scraping script")
    COOKIES = validate_tokens(COOKIES)
    if not COOKIES:
        logger.error("Failed to initialize cookies, exiting")
        return

    try:
        logger.debug("Prompting for starting HON ID")
        start_id = int(input(f"Enter starting HON ID number (default: {DEFAULT_START_ID}): ") or DEFAULT_START_ID)
        logger.debug(f"Received start_id: {start_id}")
        logger.debug("Prompting for ending HON ID")
        end_id = int(input(f"Enter ending HON ID number (default: {DEFAULT_END_ID}): ") or DEFAULT_END_ID)
        logger.debug(f"Received end_id: {end_id}")
    except ValueError as e:
        logger.error(f"Invalid input for HON ID: {str(e)}")
        print("Please enter valid numeric HON IDs.")
        return

    vehicle_ids = [f"HON{id}" for id in range(start_id, end_id + 1)]
    logger.info(f"Scraping oil data for {len(vehicle_ids)} vehicles: {vehicle_ids[0]} to {vehicle_ids[-1]}")

    results = []
    for vehicle_id in vehicle_ids:
        logger.info(f"Processing {vehicle_id}")
        now = datetime.now(timezone.utc)
        access_expiry = COOKIE_EXPIRATIONS.get("access_token", datetime.now(timezone.utc))
        if now >= access_expiry:
            logger.warning(f"access_token expired at {access_expiry}, refreshing cookies")
            COOKIES = refresh_cookies()
            if not COOKIES:
                logger.error("Failed to refresh cookies, stopping")
                break

        data = fetch_oil_data(vehicle_id, COOKIES)
        if data:
            result = extract_oil_info(data, vehicle_id)
            results.append(result)
            logger.info(f"Success: {vehicle_id} - Capacity: {result['engine_capacity']}")
        else:
            error_result = extract_oil_info(None, vehicle_id)
            results.append(error_result)
            if "Authentication failed" in error_result.get("error", ""):
                logger.warning(f"Authentication failed for {vehicle_id}, refreshing cookies")
                COOKIES = refresh_cookies()
                if not COOKIES:
                    logger.error("Failed to refresh cookies, stopping")
                    break
                data = fetch_oil_data(vehicle_id, COOKIES)
                if data:
                    result = extract_oil_info(data, vehicle_id)
                    results[-1] = result
                    logger.info(f"Retry Success: {vehicle_id} - Capacity: {result['engine_capacity']}")
        time.sleep(1)

    save_to_file(results)
    logger.info("Scraping completed")

if __name__ == "__main__":
    main()
