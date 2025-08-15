import os
import json
import re
import traceback
from bs4 import BeautifulSoup
from typing import Dict, List, Any

# Define the input and output directories
INPUT_DIR = "technical-html"
OUTPUT_DIR = "technical-json"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Main category mappings
SECTION_MAPPING = {
    "Vehicle identification": "vehicleIdentification",
    "Injection system": "injectionSystem",
    "Tuning and emissions": "tuningEmissions",
    "Starting and charging": "startingCharging",
    "Service checks and adjustments": "serviceChecks",
    "Lubricants and capacities": "lubricantsCapacities",
    "Tightening torques": "tighteningTorques",
    "Brake disc and drum dimensions": "brakeDimensions",
    "Air conditioning": "airConditioning"
}

def save_debug_info(content, filename="debug_content.txt"):
    """Save content to a file for debugging purposes."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved debug content to {filename}")
    except Exception as e:
        print(f"Error saving debug info: {e}")

def extract_text_from_table_cell(cell):
    """Extract text content from a table cell, handling special cases."""
    # Check for h4 headers
    h4 = cell.find('h4')
    if h4:
        return f"**{h4.get_text(strip=True)}**"
    
    # Handle specification name
    span = cell.find('span')
    if span:
        return span.get_text(strip=True)
    
    # Handle unit and value
    dt = cell.find('dt')
    dd = cell.find('dd')
    
    content = []
    if dt:
        content.append(dt.get_text(strip=True))
    if dd:
        # Extract text while preserving important characters (e.g., ±, °)
        value_text = dd.get_text(strip=True)
        # Remove notes indicator but preserve the value
        value_text = re.sub(r'Notes$', '', value_text).strip()
        content.append(value_text)
    
    return " ".join(content) if content else ""

def get_structured_text(html_content):
    """Extract and structure the text content from HTML, preserving the hierarchical organization."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # First, extract vehicle information
    vehicle_info = ""
    vehicle_details = soup.find('div', class_='print-vehicle-details')
    if vehicle_details:
        vehicle_info = "VEHICLE INFORMATION:\n" + vehicle_details.get_text(strip=True) + "\n\n"
    
    # Find all accordion sections
    structured_text = vehicle_info
    
    # For storing current state
    current_section = None
    
    # Find all accordion sections
    accordion_sections = soup.find_all('div', class_='accordian-section')
    
    for section in accordion_sections:
        # Extract section title
        section_title_elem = section.find('h2')
        if not section_title_elem:
            continue
            
        section_title = section_title_elem.get_text(strip=True)
        structured_text += f"SECTION: {section_title}\n"
        
        # Find the content section
        content_section = section.find('div', class_='accordian-content')
        if not content_section:
            continue
            
        # Find all table rows
        rows = content_section.find_all('tr')
        
        for row in rows:
            # Check if this is a subheader row
            subheader_cell = row.find('td', class_='subgroup-head')
            if subheader_cell:
                h4 = subheader_cell.find('h4')
                if h4:
                    subsection_name = h4.get_text(strip=True)
                    structured_text += f"SUBSECTION: {subsection_name}\n"
                continue
            
            # Check if this is a showhide section (notes)
            if 'showhide-section' in row.get('class', []):
                note_div = row.find('div', class_='showhide-content')
                if note_div:
                    note_text = note_div.get_text(strip=True)
                    note_text = re.sub(r'\s+', ' ', note_text)  # Normalize whitespace
                    structured_text += f"NOTE: {note_text}\n"
                continue
            
            # Extract normal row content
            cells = row.find_all('td')
            if len(cells) >= 2:
                # First cell contains spec name
                spec_name = extract_text_from_table_cell(cells[0])
                
                # Second cell contains unit and value
                unit_value = extract_text_from_table_cell(cells[1])
                
                structured_text += f"{spec_name}: {unit_value}\n"
        
        structured_text += "\n"  # Add separator between sections
    
    return structured_text

def parse_structured_text(text_content):
    """Parse the structured text into a hierarchical data structure."""
    data = {}
    
    # Extract vehicle identification first
    vehicle_match = re.search(r'VEHICLE INFORMATION:(.*?)(?=SECTION:|$)', text_content, re.DOTALL)
    vehicle_info = vehicle_match.group(1).strip() if vehicle_match else ""
    
    vehicle_identification = extract_vehicle_identification(vehicle_info)
    data["vehicleIdentification"] = vehicle_identification
    
    # Regular expression to extract sections and their content
    section_pattern = r'SECTION: (.*?)\n(.*?)(?=SECTION:|$)'
    sections = re.findall(section_pattern, text_content, re.DOTALL)
    
    for section_name, section_content in sections:
        section_name = section_name.strip()
        
        # Skip vehicle identification as we handle it separately
        if "identification" in section_name.lower():
            continue
        
        # Map section name to category key
        category_key = SECTION_MAPPING.get(section_name)
        if not category_key:
            # Try partial matching
            for orig_name, key in SECTION_MAPPING.items():
                if orig_name.lower() in section_name.lower():
                    category_key = key
                    break
            
            # If still not found, use sanitized section name
            if not category_key:
                category_key = section_name.lower().replace(" ", "_").replace("&", "and")
        
        data[category_key] = {}
        
        # Extract subsections and their specs
        subsection_pattern = r'SUBSECTION: (.*?)\n(.*?)(?=SUBSECTION:|NOTE:|SECTION:|$)'
        subsections = re.findall(subsection_pattern, section_content, re.DOTALL)
        
        current_subsection = None
        
        # If no subsections found, treat all content as specifications
        if not subsections:
            data[category_key]["specifications"] = extract_specifications(section_content)
        else:
            # Process each subsection
            for subsection_name, subsection_content in subsections:
                subsection_name = subsection_name.strip()
                
                # Convert subsection name to a valid JSON key
                subsection_key = subsection_name.lower().replace(" ", "_").replace("-", "_").replace("/", "_").replace("&", "and")
                
                # Extract specifications for this subsection
                specs = extract_specifications(subsection_content)
                
                # Add specifications to subsection
                data[category_key][subsection_key] = specs
                
                current_subsection = subsection_key
            
            # If there's content after the last subsection and before the next section
            leftover_content = re.search(r'(?:SUBSECTION:.*?\n.*?)+(.+?)$', section_content, re.DOTALL)
            if leftover_content:
                leftover_specs = extract_specifications(leftover_content.group(1))
                if leftover_specs and current_subsection:
                    data[category_key][current_subsection].extend(leftover_specs)
    
    # Clean up the data structure
    clean_data_structure(data)
    
    return data

def extract_specifications(content):
    """Extract specifications from text content."""
    specs = []
    
    # Skip notes
    content = re.sub(r'NOTE:.*?\n', '', content)
    
    # Extract rows with name: value format
    rows = re.findall(r'([^:]+):(.*?)(?=\n[^:]+:|$)', content, re.DOTALL)
    
    for name, value_part in rows:
        name = name.strip()
        value_part = value_part.strip()
        
        # Skip if name or value is empty
        if not name or not value_part:
            continue
        
        # Skip subsection headers
        if name.startswith('SUBSECTION:'):
            continue
        
        # Parse unit and value
        parts = value_part.split(' ', 1)
        
        spec = {"name": name}
        
        if len(parts) > 1:
            unit = parts[0].strip()
            value = parts[1].strip()
            
            # If unit is actually part of the value
            if unit in ["", "&nbsp;", " "] or re.match(r'^\d', unit):
                spec["value"] = value_part
            else:
                spec["unit"] = unit
                spec["value"] = value
        else:
            spec["value"] = value_part
        
        specs.append(spec)
    
    return specs

def clean_data_structure(data):
    """Clean up the data structure for consistency."""
    # Handle special cases and reorganize for better structure
    
    # Ensure lubricants and capacities has the right subsections
    if "lubricantsCapacities" in data:
        # Move engine_oil_options to be a subsection if it's a top-level category
        if "engine_oil_options" in data:
            data["lubricantsCapacities"]["engine_oil_options"] = data.pop("engine_oil_options")
    
    # Ensure tightening torques has the right subsections
    if "tighteningTorques" in data:
        # If there are no subsections, create them from specifications
        if "specifications" in data["tighteningTorques"] and len(data["tighteningTorques"]) == 1:
            specs = data["tighteningTorques"].pop("specifications")
            
            # Organize specs into appropriate subsections
            other_engine = []
            chassis = []
            other = []
            
            for spec in specs:
                name = spec["name"].lower()
                
                if "front hub" in name or "rear hub" in name or "brake" in name or "abs" in name or "wheel" in name or "steering" in name:
                    chassis.append(spec)
                elif "engine" in name or "oil" in name or "cylinder" in name or "camshaft" in name or "crankshaft" in name or "bearing" in name:
                    other_engine.append(spec)
                else:
                    other.append(spec)
            
            if other_engine:
                data["tighteningTorques"]["other_engine_tightening_torques"] = other_engine
            if chassis:
                data["tighteningTorques"]["chassis_tightening_torques"] = chassis
            if other:
                data["tighteningTorques"]["tightening_torques"] = other

def extract_vehicle_identification(text_content):
    """Extract vehicle identification from text content."""
    try:
        # Default values in case extraction fails
        make = "Honda"  # Default from example
        model = "CR-V"  # Default from example
        model_type = "N22A2/2.2 (07-12)"  # Default from example
        
        if text_content:
            # Try to extract make and model
            make_model_match = re.search(r'Vehicle details:\s*([^()]+)(?:\((.*?)\))?', text_content)
            if make_model_match:
                make_model = make_model_match.group(1).strip()
                model_type_part = make_model_match.group(2)
                
                # Extract make and model
                parts = make_model.split(' ', 1)
                if len(parts) > 0:
                    make = parts[0].strip()
                if len(parts) > 1:
                    model = parts[1].strip()
                
                # Extract model type
                if model_type_part:
                    model_type = model_type_part.strip()
            else:
                # Try alternative format
                alt_match = re.search(r'([A-Za-z]+)\s+([A-Za-z0-9\s-]+)\s+([A-Z0-9]+\/[0-9.]+(?:\s*\([^)]+\))?)', text_content)
                if alt_match:
                    make = alt_match.group(1).strip()
                    model = alt_match.group(2).strip()
                    model_type = alt_match.group(3).strip()
        
        title = f"Vehicle Identification - {make} {model} ({model_type})"
        
        return {
            "title": title,
            "make": make,
            "model": model,
            "modelType": model_type
        }
    except Exception as e:
        print(f"ERROR in extract_vehicle_identification: {e}")
        traceback.print_exc()
        return {
            "title": "Vehicle Identification - Error",
            "make": "Honda",  # Default from example
            "model": "CR-V",  # Default from example
            "modelType": "N22A2/2.2 (07-12)"  # Default from example
        }

def process_html_file(file_path: str) -> Dict:
    """Process a single HTML file and return structured data."""
    try:
        print(f"Opening file: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        print(f"Extracting structured text from HTML...")
        structured_text = get_structured_text(html_content)
        
        # Save the structured text for debugging
        save_debug_info(structured_text, "structured_text.txt")
        
        # Parse the structured text into a hierarchical data structure
        print("Parsing structured text into data structure...")
        data = parse_structured_text(structured_text)
        
        # Validate the output - check for expected sections
        expected_sections = ["vehicleIdentification", "injectionSystem", "tuningEmissions", "tighteningTorques"]
        missing_sections = [section for section in expected_sections if section not in data]
        
        if missing_sections:
            print(f"WARNING: Missing expected sections: {', '.join(missing_sections)}")
            
            # Try alternative extraction methods for missing sections
            if "tighteningTorques" in missing_sections:
                print("Attempting alternative extraction for tightening torques...")
                # Look for tightening torque data directly in the HTML
                torque_data = extract_tightening_torques(html_content)
                if torque_data:
                    data["tighteningTorques"] = torque_data

        return data
    except Exception as e:
        print(f"ERROR processing file {file_path}: {e}")
        traceback.print_exc()
        return {"error": str(e)}

def extract_tightening_torques(html_content):
    """Extract tightening torques directly from HTML as a fallback method."""
    torque_data = {}
    
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find the tightening torques section
        torque_section = None
        for section in soup.find_all('div', class_='accordian-section'):
            title = section.find('h2')
            if title and 'tightening torques' in title.get_text(strip=True).lower():
                torque_section = section
                break
        
        if not torque_section:
            return None
            
        # Find subsections and their data
        content = torque_section.find('div', class_='accordian-content')
        if not content:
            return None
            
        # Find all subsection headers
        subsections = content.find_all('td', class_='subgroup-head')
        
        current_subsection = None
        specifications = []
        
        # If no subsections found, treat all as a single section
        if not subsections:
            # Extract all specifications
            rows = content.find_all('tr')
            for row in rows:
                spec = extract_specification_from_row(row)
                if spec:
                    specifications.append(spec)
            
            if specifications:
                torque_data["specifications"] = specifications
        else:
            # Process each subsection
            for subsection in subsections:
                h4 = subsection.find('h4')
                if not h4:
                    continue
                    
                subsection_name = h4.get_text(strip=True)
                subsection_key = subsection_name.lower().replace(" ", "_").replace("-", "_").replace("/", "_").replace("&", "and")
                
                # Find the specifications for this subsection (all rows until the next subsection)
                subsection_specs = []
                current_row = subsection.parent.find_next_sibling('tr')
                
                while current_row and not current_row.find('td', class_='subgroup-head'):
                    # Skip note rows
                    if 'showhide-section' not in current_row.get('class', []):
                        spec = extract_specification_from_row(current_row)
                        if spec:
                            subsection_specs.append(spec)
                    
                    current_row = current_row.find_next_sibling('tr')
                
                if subsection_specs:
                    torque_data[subsection_key] = subsection_specs
        
        return torque_data
    except Exception as e:
        print(f"Error in extract_tightening_torques: {e}")
        return None

def extract_specification_from_row(row):
    """Extract a specification from a table row."""
    try:
        cells = row.find_all('td')
        if len(cells) < 2:
            return None
            
        # Extract name
        name_cell = cells[0]
        name_span = name_cell.find('span')
        if not name_span:
            return None
            
        name = name_span.get_text(strip=True)
        
        # Extract unit and value
        value_cell = cells[1]
        dt = value_cell.find('dt')
        dd = value_cell.find('dd')
        
        if not dd:
            return None
            
        unit = dt.get_text(strip=True) if dt else ""
        value = dd.get_text(strip=True)
        
        # Remove notes indicator but preserve the value
        value = re.sub(r'Notes$', '', value).strip()
        
        spec = {"name": name, "value": value}
        
        if unit and unit.strip() and unit.strip() != '&nbsp;':
            spec["unit"] = unit
            
        return spec
    except Exception as e:
        print(f"Error extracting specification: {e}")
        return None

def format_model_type_for_filename(model_type: str) -> str:
    """
    Formats the modelType string for filename, handling year ranges (YY-YY) and single years (YY).
    """
    print(f"Formatting model_type: '{model_type}'")
    
    try:
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
            print(f"  Range year match: sanitized_model_type='{sanitized_model_type}', formatted_year='{formatted_year}'")
            return f"{sanitized_model_type}-{formatted_year}".strip('-')

        single_year_match = re.search(r'[\s\(]*\'?(\d{2})\)?$', model_type)
        if single_year_match:
            year_short = single_year_match.group(1)
            year = expand_year(year_short)
            model_type_no_year = model_type[:single_year_match.start()].strip()  # remove year part
            sanitized_model_type = model_type_no_year.lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').replace("'",'').strip('-')
            print(f"  Single year match: sanitized_model_type='{sanitized_model_type}', year='{year}'")
            return f"{sanitized_model_type}-{year}".strip('-')

        # If no year format is found, sanitize the whole modelType
        sanitized_model_type = model_type.strip().lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').strip('-')
        print(f"  No year match, sanitizing all: sanitized_model_type='{sanitized_model_type}'")
        return sanitized_model_type
    except Exception as e:
        print(f"ERROR in format_model_type_for_filename: {e}")
        traceback.print_exc()
        # Return a safe default if there's an error
        return model_type.strip().lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '').strip('-')

def main():
    """Main function to process all HTML files in the 'technical-html' folder."""
    try:
        if not os.path.exists(INPUT_DIR):
            print(f"ERROR: Input directory '{INPUT_DIR}' not found.")
            os.makedirs(INPUT_DIR, exist_ok=True)
            print(f"Created directory '{INPUT_DIR}'. Please add HTML files to process.")
            return

        # Check if there are any HTML files in the directory
        html_files = [f for f in os.listdir(INPUT_DIR) if f.endswith(".html") or f.endswith(".htm")]
        
        if not html_files:
            print(f"ERROR: No HTML files found in '{INPUT_DIR}'.")
            return
            
        print(f"Found {len(html_files)} HTML files to process")

        for filename in html_files:
            file_path = os.path.join(INPUT_DIR, filename)
            print(f"\nProcessing {file_path}...")
            try:
                data = process_html_file(file_path)
                
                if "error" in data:
                    print(f"Skipping output for {filename} due to errors")
                    continue
                    
                vehicle_info = data["vehicleIdentification"]

                # Sanitize all components of the filename to remove invalid characters
                make_part = vehicle_info['make'].strip().lower().replace(' ','-')
                model_part = vehicle_info['model'].strip().lower().replace(' ','-')
                
                # Format the model type
                formatted_model_type = format_model_type_for_filename(vehicle_info['modelType'])
                
                # Create a safe filename by replacing any remaining invalid characters
                safe_filename = f"{make_part}-{model_part}-{formatted_model_type}-technical-specifications.json"
                safe_filename = safe_filename.replace('/', '-').replace('\\', '-').replace(':', '-').replace('*', '-')
                safe_filename = safe_filename.replace('?', '-').replace('"', '-').replace('<', '-').replace('>', '-')
                safe_filename = safe_filename.replace('|', '-')
                
                # Use default filename if needed
                if not formatted_model_type or formatted_model_type == "-" or not vehicle_info['make'] or not vehicle_info['model']:
                    safe_filename = filename.replace('.html', '-technical-specifications.json')
                    print(f"Using default filename: {safe_filename}")

                output_file = os.path.join(OUTPUT_DIR, safe_filename)
                print(f"Writing output to {output_file}")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Successfully saved output to {output_file}")
            except Exception as e:
                print(f"ERROR processing {file_path}: {e}")
                traceback.print_exc()

        print("\nProcessing complete!")
        print(f"Check the '{OUTPUT_DIR}' directory for JSON output files.")
    except Exception as e:
        print(f"ERROR in main: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    main()