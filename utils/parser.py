#!/usr/bin/env python3
"""
Script to extract content from HTML bulletin files and convert to JSON format.
This script automatically processes vehicle data from all_fixes and fix_details folders,
and generates a single JSON file per vehicle containing all known fixes.
"""

import os
import re
import json
from bs4 import BeautifulSoup
from pathlib import Path
import logging
import uuid

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def clean_text(text):
    """Clean up text by removing extra whitespace and fixing common HTML entities."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('&rarr;', '→')
    text = text.replace('&nbsp;', ' ')
    text = text.replace('\xa0', ' ')  # Non-breaking space
    return text

def extract_vehicle_id_from_folder(folder_path):
    """Extract vehicle ID from folder name."""
    folder_name = Path(folder_path).name
    # Look for ID-XXX##### pattern
    id_match = re.search(r'ID-([A-Z]{3}\d+)', folder_name)
    if id_match:
        return id_match.group(1)
    
    # Fallback to just looking for known patterns
    id_match = re.search(r'(HON\d+|TOY\d+|BMW\d+|MBZ\d+|VAG\d+)', folder_name)
    if id_match:
        return id_match.group(1)
    
    return None

def extract_vehicle_info_from_folder(folder_path):
    """Extract vehicle make, model, and engine info from folder name."""
    folder_name = Path(folder_path).name
    
    # Extract parts from folder name pattern: "{make} {model} - {engine_info} - ID-{vehicle_id}"
    parts = folder_name.split(' - ')
    
    vehicle_info = {
        "make": "",
        "model": "",
        "make_model": "",
        "engine_info": "",
        "vehicle_id": ""
    }
    
    if len(parts) >= 1:
        # First part should be make and model
        make_model = parts[0].strip()
        vehicle_info["make_model"] = make_model
        
        # Attempt to split make and model
        if " " in make_model:
            make_parts = make_model.split(" ", 1)
            vehicle_info["make"] = make_parts[0]
            vehicle_info["model"] = make_parts[1]
        else:
            vehicle_info["make"] = make_model
    
    if len(parts) >= 2:
        # Second part should be engine info
        vehicle_info["engine_info"] = parts[1].strip()
    
    if len(parts) >= 3:
        # Third part should contain vehicle ID
        id_match = re.search(r'ID-([A-Z]{3}\d+)', parts[2])
        if id_match:
            vehicle_info["vehicle_id"] = id_match.group(1)
    
    return vehicle_info

def load_vehicle_metadata(folder_path):
    """Load vehicle metadata from JSON file if available."""
    vehicle_id = extract_vehicle_id_from_folder(folder_path)
    if not vehicle_id:
        return None
    
    # First, check for vehicle details JSON file in the current folder
    json_file = None
    for file in Path(folder_path).glob(f"*{vehicle_id}_vehicle_details.json"):
        json_file = file
        break
    
    # If not found in current folder, check in all_fixes folder
    if not json_file:
        # If we're in fix_details directory, check corresponding all_fixes folder
        if 'fix_details' in str(folder_path):
            all_fixes_path = str(folder_path).replace('fix_details', 'all_fixes')
            # Make sure the path exists
            if os.path.exists(all_fixes_path):
                for file in Path(all_fixes_path).glob(f"*{vehicle_id}_vehicle_details.json"):
                    json_file = file
                    break
        
        # If still not found, try to find in any all_fixes subfolder with same name
        if not json_file:
            all_fixes_dir = Path('all_fixes')
            if all_fixes_dir.exists():
                folder_name = Path(folder_path).name
                for subdir in all_fixes_dir.iterdir():
                    if subdir.is_dir() and folder_name == subdir.name:
                        for file in subdir.glob(f"*{vehicle_id}_vehicle_details.json"):
                            json_file = file
                            break
    
    # Process the JSON file if found
    if json_file and json_file.exists():
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                logger.info(f"Loaded metadata from {json_file}")
                return metadata
        except Exception as e:
            logger.error(f"Error loading metadata from {json_file}: {e}")
    
    # If we couldn't load from JSON, extract from folder name
    logger.info(f"No metadata file found, extracting from folder name: {folder_path}")
    return extract_vehicle_info_from_folder(folder_path)

def get_page_type(html_content):
    """Determine if the page is a bulletin detail page or a main listing page."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Check for the known-fixes class which appears on the main page
    if soup.find('div', class_='known-fixes'):
        return "main_page"
    
    # Check if it has a bulletin's specific content structure
    if soup.find('div', class_='xml-content') and soup.find('h2'):
        return "bulletin_detail"
    
    # If we can't determine, default to unknown
    return "unknown"

def extract_bulletin_detail(html_content):
    """Extract structured data from an individual bulletin page."""
    soup = BeautifulSoup(html_content, 'html.parser')
    xml_content_div = soup.find('div', class_='xml-content')
    
    if not xml_content_div:
        logger.warning("No xml-content div found in the HTML.")
        return {"error": "No content found"}
    
    # Initialize the bulletin data structure
    bulletin_data = {
        "id": str(uuid.uuid4()),  # Generate a unique ID
        "title": "",
        "affected_vehicles": [],
        "problems": [],
        "causes": [],
        "remedy": {
            "parts": [],
            "steps": []
        },
        "notes": []
    }
    
    # Extract the title
    title = xml_content_div.find('h2')
    if title:
        bulletin_data["title"] = clean_text(title.text)
    
    # Process all sections
    current_section = None
    remedy_subsection = None
    for element in xml_content_div.find_all(['h3', 'h4', 'p', 'ul', 'table']):
        if element.name == 'h3':
            current_section = clean_text(element.text).lower()
            if current_section == "affected vehicles":
                continue
            elif current_section == "problem":
                continue
            elif current_section == "cause":
                continue
            elif current_section == "remedy":
                continue
        
        elif element.name == 'h4' and current_section == "remedy":
            remedy_subsection = clean_text(element.text).lower()
        
        elif current_section == "affected vehicles":
            if element.name == 'ul':
                for li in element.find_all('li', recursive=True):
                    # Skip nested ULs, only process direct text
                    if not li.find('ul'):
                        bulletin_data["affected_vehicles"].append(clean_text(li.get_text()))
        
        elif current_section == "problem":
            if element.name == 'ul':
                for li in element.find_all('li', recursive=True):
                    # Look for links which are often problems
                    links = li.find_all('a')
                    if links:
                        for link in links:
                            bulletin_data["problems"].append(clean_text(link.text))
                    else:
                        text = clean_text(li.get_text())
                        if text:
                            bulletin_data["problems"].append(text)
        
        elif current_section == "cause":
            if element.name == 'ul':
                for li in element.find_all('li', recursive=True):
                    cause_text = clean_text(li.get_text())
                    if cause_text:
                        bulletin_data["causes"].append(cause_text)
        
        elif current_section == "remedy":
            if element.name == 'table' and remedy_subsection == "parts":
                # Process parts table
                for row in element.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if cells and len(cells) >= 2:
                        part = {
                            "name": clean_text(cells[0].text),
                            "part_number": clean_text(cells[1].text)
                        }
                        if len(cells) >= 3:
                            part["quantity"] = clean_text(cells[2].text)
                        bulletin_data["remedy"]["parts"].append(part)
            elif element.name == 'ul':
                # Process remedy steps
                for li in element.find_all('li', recursive=True):
                    step_text = clean_text(li.get_text())
                    if step_text:
                        bulletin_data["remedy"]["steps"].append(step_text)
        
        # Handle notes which can appear anywhere
        if element.name == 'p' and 'note' in element.get('class', []) or (element.name == 'p' and element.text.strip().lower().startswith('note:')):
            bulletin_data["notes"].append(clean_text(element.text))
    
    return bulletin_data

def extract_main_page(html_content, filename="", vehicle_metadata=None):
    """Extract structured data from a main bulletin listing page."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find vehicle information (if available)
    vehicle_info = {
        "manufacturer": "",
        "model": "",
        "engine_code": ""
    }
    
    # Use metadata if provided
    if vehicle_metadata:
        if "make" in vehicle_metadata:
            vehicle_info["manufacturer"] = vehicle_metadata["make"]
        
        if "model" in vehicle_metadata:
            vehicle_info["model"] = vehicle_metadata["model"]
        
        if "engine_info" in vehicle_metadata:
            # Try to extract engine code
            engine_text = vehicle_metadata["engine_info"]
            engine_match = re.search(r'([A-Z0-9]+)[/_]', engine_text)
            if engine_match:
                vehicle_info["engine_code"] = engine_match.group(1)
    
    # Try to get vehicle info from page content if not already set
    if not vehicle_info["manufacturer"] or not vehicle_info["model"]:
        job_folder = soup.find('div', class_='job-folder')
        if job_folder:
            manufacturer = job_folder.find('li', class_='displayManufacturer')
            if manufacturer and not vehicle_info["manufacturer"]:
                vehicle_info["manufacturer"] = clean_text(manufacturer.text)
            
            model = job_folder.find('li', class_='displayModel')
            if model and not vehicle_info["model"]:
                vehicle_info["model"] = clean_text(model.text)
            
            engine_info = job_folder.find('li', class_='engine-code')
            if engine_info and not vehicle_info["engine_code"]:
                engine_text = clean_text(engine_info.text)
                # Extract just the engine code from text like "Engine code: N22A2"
                engine_match = re.search(r'Engine\s+code:\s+([A-Z0-9]+)', engine_text)
                if engine_match:
                    vehicle_info["engine_code"] = engine_match.group(1)
    
    # Get the vehicle ID from the metadata, URL, or filename
    vehicle_id = ""
    if vehicle_metadata and "vehicle_id" in vehicle_metadata:
        vehicle_id = vehicle_metadata["vehicle_id"]
    
    if not vehicle_id and filename:
        # Extract vehicle ID from filename or URL paths
        id_match = re.search(r'(HON\d+|TOY\d+|BMW\d+|MBZ\d+|VAG\d+)', filename)
        if id_match:
            vehicle_id = id_match.group(1)
    
    # Initialize the main page data structure
    main_data = {
        "vehicle_id": vehicle_id,
        "vehicle_info": vehicle_info,
        "categories": {}
    }
    
    # Add full metadata if available
    if vehicle_metadata:
        main_data["metadata"] = vehicle_metadata
    
    # Process each accordion section (category)
    accordion_sections = soup.find_all('div', id='accordian-section', class_='accordian-section')
    for section in accordion_sections:
        # Get category name
        category_header = section.find('h2')
        if not category_header:
            continue
        
        category_name = clean_text(category_header.text)
        main_data["categories"][category_name] = []
        
        # Get all bulletin links in this category
        content_div = section.find('div', class_='accordian-content')
        if not content_div:
            continue
            
        xml_content = content_div.find('div', class_='xml-content')
        if not xml_content:
            continue
            
        links = xml_content.find_all('a')
        for link in links:
            href = link.get('href', '')
            title = clean_text(link.text)
            kf_name = link.get('kf_name', '')
            
            bulletin_id = ""
            # Extract the bulletin ID from href like "/w1/known-fixes/HON17665/14"
            match = re.search(r'/w1/known-fixes/[A-Z0-9]+/(\d+)', href)
            if match:
                bulletin_id = match.group(1)
            
            main_data["categories"][category_name].append({
                "id": bulletin_id,
                "title": title or kf_name,
                "href": href
            })
    
    return main_data

def process_file(input_file, output_dir, vehicle_metadata=None):
    """Process an individual HTML file and convert to JSON."""
    try:
        # Read the HTML file
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # If metadata not provided, try to extract from parent folder
        if not vehicle_metadata:
            vehicle_metadata = load_vehicle_metadata(input_file.parent)
        
        # Determine the page type
        page_type = get_page_type(html_content)
        
        # Extract data based on page type
        if page_type == "bulletin_detail":
            data = extract_bulletin_detail(html_content)
            # Add metadata to bulletin detail
            if vehicle_metadata:
                data["vehicle_metadata"] = vehicle_metadata
        elif page_type == "main_page":
            data = extract_main_page(html_content, str(input_file), vehicle_metadata)
        else:
            logger.warning(f"Unknown page type for file: {input_file}")
            return False
        
        # Create output file path (use same structure but with .json extension)
        rel_path = input_file.relative_to(input_file.parent)
        output_file = output_dir / rel_path.with_suffix('.json')
        
        # Create parent directories if needed
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Write the JSON data to the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Processed: {input_file} -> {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error processing {input_file}: {e}")
        return False

# Note: The group_by_vehicle and process_by_folder functions are no longer needed
# as they've been replaced by the collect_vehicle_data function

def collect_vehicle_data():
    """
    Collect all vehicle data from both all_fixes and fix_details directories,
    process all HTML files, and generate a single JSON file per vehicle.
    """
    # Hardcoded paths
    all_fixes_path = Path('all_fixes')
    fix_details_path = Path('fix_details')
    output_path = Path('fix_details_json')
    
    # Create output directory if it doesn't exist
    if not output_path.exists():
        output_path.mkdir(parents=True)
    
    logger.info("Starting processing of vehicle bulletins")
    
    # Collect all vehicle folders from both directories
    vehicle_folders = {}
    
    # First collect from all_fixes
    if all_fixes_path.exists():
        for folder_path in [p for p in all_fixes_path.glob('*') if p.is_dir()]:
            vehicle_id = extract_vehicle_id_from_folder(folder_path)
            if vehicle_id:
                metadata = load_vehicle_metadata(folder_path)
                vehicle_folders[vehicle_id] = {
                    "metadata_folder": folder_path,
                    "metadata": metadata
                }
                logger.info(f"Found vehicle {vehicle_id} in all_fixes: {folder_path.name}")
    
    # Then collect from fix_details
    if fix_details_path.exists():
        for folder_path in [p for p in fix_details_path.glob('*') if p.is_dir()]:
            vehicle_id = extract_vehicle_id_from_folder(folder_path)
            if vehicle_id:
                if vehicle_id not in vehicle_folders:
                    metadata = load_vehicle_metadata(folder_path)
                    vehicle_folders[vehicle_id] = {
                        "metadata_folder": folder_path,
                        "metadata": metadata
                    }
                vehicle_folders[vehicle_id]["details_folder"] = folder_path
                logger.info(f"Found vehicle {vehicle_id} in fix_details: {folder_path.name}")
    
    # Process vehicle data and create JSON files
    vehicle_data = {}
    
    # First process main pages from all_fixes for each vehicle
    for vehicle_id, folders in vehicle_folders.items():
        if "metadata_folder" in folders:
            main_html_files = list(folders["metadata_folder"].glob('*_fixes_main.html'))
            if main_html_files:
                main_html_file = main_html_files[0]
                try:
                    with open(main_html_file, 'r', encoding='utf-8') as f:
                        html_content = f.read()
                    
                    main_data = extract_main_page(html_content, str(main_html_file), folders["metadata"])
                    
                    # Initialize vehicle data
                    vehicle_data[vehicle_id] = {
                        "vehicle_id": vehicle_id,
                        "vehicle_info": main_data.get("vehicle_info", {}),
                        "metadata": folders["metadata"],
                        "categories": main_data.get("categories", {}),
                        "bulletins": []
                    }
                    logger.info(f"Processed main page for {vehicle_id}")
                except Exception as e:
                    logger.error(f"Error processing main page for {vehicle_id}: {e}")
    
    # Process bulletin details for each vehicle
    for vehicle_id, folders in vehicle_folders.items():
        if "details_folder" in folders:
            # Make sure vehicle exists in our data
            if vehicle_id not in vehicle_data:
                vehicle_data[vehicle_id] = {
                    "vehicle_id": vehicle_id,
                    "metadata": folders.get("metadata", {}),
                    "bulletins": []
                }
            
            # Process all HTML files in the details folder (except main page)
            detail_html_files = [f for f in folders["details_folder"].glob('*.html') 
                                if not f.name.endswith('_fixes_main.html')]
            
            for html_file in detail_html_files:
                try:
                    with open(html_file, 'r', encoding='utf-8') as f:
                        html_content = f.read()
                    
                    if get_page_type(html_content) == "bulletin_detail":
                        data = extract_bulletin_detail(html_content)
                        
                        # Extract bulletin ID from filename
                        bulletin_id = None
                        id_match = re.search(r'/(\d+)(?:\?|\.html)', str(html_file))
                        if id_match:
                            bulletin_id = id_match.group(1)
                        else:
                            # Try to extract from filename
                            id_match = re.search(r'fix_(\d+)', html_file.name)
                            if id_match:
                                bulletin_id = id_match.group(1)
                        
                        if bulletin_id:
                            data["id"] = bulletin_id
                        
                        vehicle_data[vehicle_id]["bulletins"].append(data)
                        logger.info(f"Processed bulletin detail for {vehicle_id}: {html_file.name}")
                except Exception as e:
                    logger.error(f"Error processing detail file {html_file}: {e}")
    
    # Save the grouped data to JSON files
    vehicles_processed = 0
    
    for vehicle_id, data in vehicle_data.items():
        # Create descriptive filename using metadata
        filename = vehicle_id
        if "metadata" in data and data["metadata"]:
            metadata = data["metadata"]
            if "make" in metadata and "model" in metadata:
                make = metadata["make"].replace(" ", "_")
                model = metadata["model"].replace(" ", "_")
                filename = f"{make}_{model}_{vehicle_id}"
        
        output_file = output_path / f"{filename}.json"
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Created JSON file: {output_file} with {len(data.get('bulletins', []))} bulletins")
            vehicles_processed += 1
        except Exception as e:
            logger.error(f"Error saving JSON for {vehicle_id}: {e}")
    
    logger.info(f"Processing complete. Created JSON files for {vehicles_processed} vehicles in {output_path}/")
    return vehicles_processed

def main():
    """Main function that requires no arguments."""
    vehicles_processed = collect_vehicle_data()
    print(f"Successfully processed {vehicles_processed} vehicles.")

if __name__ == "__main__":
    main()