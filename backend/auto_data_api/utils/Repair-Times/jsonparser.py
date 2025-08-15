import os
import json
from bs4 import BeautifulSoup
from typing import Dict, List
import re

# Define the output directory for JSON files
OUTPUT_DIR = "output_json"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mapping of accordion section titles to JSON structure categories and subcategories
SECTION_MAPPING = {
    "Engine": {
        "engineAssembly": "Engine Assembly",
        "cylinderHead": "Cylinder Head",
        "camshaftDrive": "Camshaft & Drive Gear",
        "crankshaft": "Crankshaft & Pistons",
        "lubrication": "Lubrication",
        "auxiliaryDrive": "Auxiliary Drive"
    },
    "Engine management - Fuel": {
        "airFilter": "Air Filter, Manifolds & Plenum Chamber",
        "throttleControls": "Throttle Controls",
        "dieselInjection": "Diesel Injection System",
        "fuelSupply": "Fuel Supply",
        "turbocharger": "Turbocharger"
    },
    "Cooling system": {
        "radiator": "Radiator, Fan & Intercooler",
        "pumpDrive": "Pump & Drive",
        "headerTank": "Header Tank & Hoses"
    },
    "Exhaust system": {
        "manifold": "Manifold, Pipes & Silencers",
        "exhaustGas": "Exhaust Gas Aftertreatment"
    },
    "Clutch & controls": {
        "clutchControls": "Clutch Pedal, Linkage & Hydraulics",
        "clutchUnit": "Clutch Unit & Flywheel"
    },
    "Manual transmission": {
        "manualTransmission": "Manual Transmission"
    },
    "Automatic transmission": {
        "automaticTransmission": "Automatic Transmission" # Added Automatic Transmission Section - not used in example output but in HTML
    },
    "Final drive, shaft & axles": {
        "finalDrive": "Final Drive, Shaft & Axles"
    },
    "Suspension": { # Suspension Section - not used in example output but in HTML
        "frontSuspension": "Front Suspension",
        "rearSuspension": "Rear Suspension"
    },
    "Steering": { # Steering Section - not used in example output but in HTML
        "steeringGeometry": "Steering Geometry",
        "steeringMechanism": "Steering Mechanism",
        "wheels": "Wheels"
    },
    "Brakes": {
        "brakingSystem": "Braking System Hydraulics",
        "footbrakes": "Footbrakes",
        "brakePedal": "Brake Pedal & Servo",
        "absSystems": "ABS or ABS/ESP",
        "parkingBrake": "Parking Brake"
    },
    "General electrics": {
        "batteryCables": "Battery & Cables",
        "chargingSystem": "Charging System",
        "startingSystem": "Starting System",
        "bulbsLeds": "Bulbs & LEDs",
        "frontLamps": "Front Lamps",
        "rearLamps": "Rear Lamps",
        "interiorLamps": "Interior Lamps", # Added Interior Lamps Section
        "switches": "Switches", # Added Switches Section
        "instruments": "Instruments", # Added Instruments Section
        "sensors": "Transducers, Sensors & Transmitters", # Renamed to match example
        "fuseboxRelays": "Fusebox & Relays", # Renamed to match example
        "motors": "Motors", # Added Motors Section
        "audioUnits": "Control & Audio Units", # Added Control & Audio Units Section
        "wipers": "Windscreen Wipers/Washers",
        "headlampWipers": "Headlamp Wipers/Washers",
        "rearScreenWipers": "Rear Screen Wipers/Washers"
    },
    "Air conditioning & heating": {
        "heating": "Heating & Ventilation System",
        "airConditioning": "Air Conditioning"
    },
    "Body - Front section": { # Body Sections - not used in example output but in HTML
        "frontBumper": "Front Bumper/Spoiler",
        "bonnet": "Bonnet",
        "windscreen": "Windscreen"
    },
    "Body - Centre section": {
        "frontDoor": "Front Door",
        "interiorSeats": "Interior/Seats/Seatbelts" # Renamed to match example and added to body section
    },
    "Body - Rear section": {
        "rearBumper": "Rear Bumper",
        "bootLid": "Boot lid",
        "backDoor": "Back door",
        "rearWing": "Rear wing",
        "rearScreen": "Rear screen"
    }
}


def extract_vehicle_identification(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract vehicle identification details from the HTML and include modelType in title."""
    vehicle_details = soup.select_one(".print-vehicle-details")
    if not vehicle_details:
        return {"title": "Vehicle Identification - Model details not found", "make": "", "model": "", "modelType": ""}

    make_model_element = vehicle_details.select_one(".print-manufacturer-model")
    make_model_text = make_model_element.get_text(strip=True).replace("Vehicle details:", "").strip() if make_model_element else ""
    other_details_element = vehicle_details.select_one(".print-other-details")
    other_details_text = other_details_element.get_text(strip=True).strip() if other_details_element else ""


    # Split make and model (assuming first word is make)
    make_model_split = make_model_text.split(" ", 1)
    make = make_model_split[0] if len(make_model_split) > 0 else ""
    model = make_model_split[1] if len(make_model_split) > 1 else ""

    # Construct dynamic title including modelType
    title = "Vehicle Identification"
    if make and model and other_details_text:
        title = f"{title} - {make.strip()} {model.strip()} ({other_details_text.strip()})"
    elif make and model:
        title = f"{title} - {make.strip()} {model.strip()}"
    else:
        title = f"{title} - Model details not available"

    return {
        "title": title,
        "make": make.strip(),
        "model": model.strip(),
        "modelType": other_details_text.strip()
    }


def extract_repair_times(soup: BeautifulSoup) -> Dict[str, Dict[str, List[Dict]]]:
    """Extract repair times and organize them into the specified JSON structure."""
    data = {
        "engineData": {},
        "fuelManagement": {},
        "cooling": {},
        "exhaust": {},
        "drivetrain": {},
        "brakes": {},
        "climate": {},
        "electrical": {},
        "body": {} # Added body section
    }

    # Find all accordion sections
    accordion_sections = soup.select(".accordian-section")
    for section in accordion_sections:
        section_title = section.select_one(".accordian-head h2").get_text(strip=True)

        # Correctly determine top-level category and mapping based on section_title
        top_category = None
        mapping = None
        for cat_name, cat_mapping in SECTION_MAPPING.items():
            if cat_name.lower() in section_title.lower():
                if "Engine" in cat_name:
                    top_category = "engineData"
                elif "Fuel" in cat_name:
                    top_category = "fuelManagement"
                elif "Cooling" in cat_name:
                    top_category = "cooling"
                elif "Exhaust" in cat_name:
                    top_category = "exhaust"
                elif "Transmission" in cat_name:
                    top_category = "drivetrain"
                elif "Brakes" in cat_name:
                    top_category = "brakes"
                elif "Air conditioning" in cat_name:
                    top_category = "climate"
                elif "General electrics" in cat_name:
                    top_category = "electrical"
                elif "Body" in cat_name: # Handle Body sections
                    top_category = "body"
                mapping = cat_mapping
                break # Stop after finding the first match

        if not top_category or not mapping:
            continue


        # Process each subsection within the accordion
        subsections = section.select(".inlineShowHide")
        for subsection in subsections:
            subsection_title_elem = subsection.select_one(".inlineShowHideTrigger.main-section")
            if not subsection_title_elem:
                continue
            subsection_title = subsection_title_elem.get_text(strip=True).replace('\n', ' ').strip()


            # Map subsection to a key in the JSON structure
            sub_key = None
            for k, v in mapping.items():
                if v.lower() in subsection_title.lower():
                    sub_key = k
                    break

            if not sub_key:
                continue


            # Initialize the subsection in the data structure
            if sub_key not in data[top_category]:
                data[top_category][sub_key] = {
                    "title": mapping[sub_key],
                    "details": []
                }

            # Extract table data
            table = subsection.select_one("table")
            if not table:
                continue

            rows = table.select("tbody tr")
            for row in rows:
                cols = row.select("td")
                if len(cols) < 3:
                    continue

                action = cols[0].get_text(strip=True)
                component_element = cols[1]
                component_parts = [part.strip() for part in component_element.stripped_strings]
                component = " - ".join(component_parts) if component_parts else "" # Join component parts with hyphen

                hours = cols[2].get_text(strip=True).replace(' ', '').strip() # Remove   and strip whitespace


                label = f"{action} - {component}" if component else action # Construct label more clearly

                data[top_category][sub_key]["details"].append({
                    "label": label.strip(), # Ensure label is stripped
                    "value": hours,
                    "unit": "hours"
                })

    return data


def process_html_file(file_path: str) -> Dict:
    """Process a single HTML file and return structured data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')

    # Extract vehicle identification
    vehicle_identification = extract_vehicle_identification(soup)

    # Extract repair times
    repair_times = extract_repair_times(soup)

    # Combine into final structure
    result = {
        "vehicleIdentification": vehicle_identification,
        **repair_times
    }

    return result

def format_model_type_for_filename(model_type: str) -> str:
    """
    Formats the modelType string for filename, handling year ranges (YY-YY) and single years (YY).
    Uses a pivot year to determine century:
    - Years 00-49 are interpreted as 2000-2049
    - Years 50-99 are interpreted as 1950-1999
    
    Example: "W16 D16 (9HZ)/1.6 (R55) (07-14)" becomes "w16-d16-9hz-1.6-r55-2007-2014"
    Example: "Some Model (17)" becomes "some-model-2017"
    Example: "244DT/2.4 (L316) (90-16)" becomes "244dt-2.4-l316-1990-2016"
    """
    print(f"Formatting model_type: '{model_type}'")  # Debugging print
    
    # Define pivot year for century determination
    pivot_year = 50
    
    def expand_year(year_short):
        """Expands a 2-digit year to 4 digits using the pivot year logic."""
        year_int = int(year_short)
        if year_int < pivot_year:
            return f"20{year_short}"
        else:
            return f"19{year_short}"

    year_range_match = re.search(r'\((\d{2})-(\d{2})\)$', model_type)
    if year_range_match:
        start_year_short, end_year_short = year_range_match.groups()
        start_year = expand_year(start_year_short)
        end_year = expand_year(end_year_short)
        formatted_year = f"{start_year}-{end_year}"
        model_type_no_year = model_type[:year_range_match.start()].strip()  # remove year part
        sanitized_model_type = model_type_no_year.lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').strip('-')  # sanitize rest of model type
        print(f"  Range year match: sanitized_model_type='{sanitized_model_type}', formatted_year='{formatted_year}'")  # Debugging print
        return f"{sanitized_model_type}-{formatted_year}".strip('-')

    single_year_match = re.search(r'[\s\(]*\'?(\d{2})\)?$', model_type)  # Modified regex to handle whitespace, optional '(' and optional ' after year
    if single_year_match:
        year_short = single_year_match.group(1)
        year = expand_year(year_short)
        model_type_no_year = model_type[:single_year_match.start()].strip()  # remove year part
        sanitized_model_type = model_type_no_year.lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').replace("'",'').strip('-')  # sanitize rest of model type, remove single quote
        print(f"  Single year match: sanitized_model_type='{sanitized_model_type}', year='{year}'")  # Debugging print
        return f"{sanitized_model_type}-{year}".strip('-')

    else:
        # If no year in (YY-YY) or (YY) format is found, sanitize the whole modelType as before
        sanitized_model_type = model_type.strip().lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').strip('-')
        print(f"  No year match, sanitizing all: sanitized_model_type='{sanitized_model_type}'")  # Debugging print
        return sanitized_model_type

def main():
    """Main function to process all HTML files in the 'html' folder."""
    html_dir = "html"
    if not os.path.exists(html_dir):
        print(f"Directory '{html_dir}' not found.")
        return

    for filename in os.listdir(html_dir):
        if filename.endswith(".html"):
            file_path = os.path.join(html_dir, filename)
            print(f"Processing {file_path}...")
            try:
                data = process_html_file(file_path)
                vehicle_info = data["vehicleIdentification"]

                # Construct filename including formatted modelType
                formatted_model_type = format_model_type_for_filename(vehicle_info['modelType'])
                output_filename = f"{vehicle_info['make'].strip().lower().replace(' ','-')}-{vehicle_info['model'].strip().lower().replace(' ','-')}-{formatted_model_type}-repair-times.json"

                output_file = os.path.join(OUTPUT_DIR, output_filename)
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Saved output to {output_file}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")


if __name__ == "__main__":
    main()