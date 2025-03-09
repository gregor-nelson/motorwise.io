import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("mot_manual_api.log")
    ]
)
logger = logging.getLogger("mot_manual_api")

# Initialize FastAPI app
app = FastAPI(
    title="MOT Manual API",
    description="API service providing MOT manual data for defect lookup",
    version="1.0.0",
)

# Add CORS middleware
CORS_ORIGINS = [
    "https://check-mot.co.uk",
    "https://www.check-mot.co.uk",
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev server default
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# MOT Manual data model
class Defect(BaseModel):
    description: str
    category: str

class Item(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    defects: Optional[List[Defect]] = None

class Subsection(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    items: List[Item]

class Section(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    subsections: List[Subsection]

class MotManual(BaseModel):
    title: str
    sections: List[Section]

# Load MOT Manual data
MOT_MANUAL_DATA = None
MOT_MANUAL_INDEX = {}
MOT_MANUAL_FILE = os.environ.get("MOT_MANUAL_FILE", "mot_manual.json")

def load_mot_manual():
    global MOT_MANUAL_DATA
    try:
        with open(MOT_MANUAL_FILE, 'r') as f:
            data = json.load(f)
            # Validate structure
            validate_mot_manual_structure(data)
            MOT_MANUAL_DATA = data
            logger.info(f"Successfully loaded MOT manual data from {MOT_MANUAL_FILE}")
            return data
    except Exception as e:
        logger.error(f"Failed to load MOT manual data: {str(e)}")
        raise

def validate_mot_manual_structure(data):
    """Basic validation of the MOT manual structure"""
    if not isinstance(data, dict) or "sections" not in data:
        logger.error("Invalid MOT manual structure: missing 'sections'")
        raise ValueError("Invalid MOT manual structure: missing 'sections'")
    
    for section in data["sections"]:
        if "id" not in section or "title" not in section:
            logger.error(f"Section missing required fields: {section}")
            raise ValueError(f"Section missing required fields: {section}")
        
        if "subsections" not in section:
            logger.warning(f"Section {section['id']} has no subsections")
            continue
            
        for subsection in section["subsections"]:
            if "id" not in subsection or "title" not in subsection:
                logger.error(f"Subsection missing required fields: {subsection}")
                raise ValueError(f"Subsection missing required fields: {subsection}")
            
            # Validate subsection ID format (should be section_id.number)
            section_id = section["id"]
            if not subsection["id"].startswith(f"{section_id}."):
                logger.warning(f"Subsection ID {subsection['id']} does not follow expected format {section_id}.X")
            
            if "items" not in subsection:
                logger.warning(f"Subsection {subsection['id']} has no items")
                continue
                
            for item in subsection["items"]:
                if "id" not in item or "title" not in item:
                    logger.error(f"Item missing required fields: {item}")
                    raise ValueError(f"Item missing required fields: {item}")
                
                # Validate item ID format (should be subsection_id.number)
                subsection_id = subsection["id"]
                if not item["id"].startswith(f"{subsection_id}."):
                    logger.warning(f"Item ID {item['id']} does not follow expected format {subsection_id}.X")

# Create an in-memory index for faster lookups
def build_index(manual_data):
    index = {}
    if not manual_data or "sections" not in manual_data:
        return index
    
    for section in manual_data["sections"]:
        section_id = section["id"]
        index[section_id] = {
            "type": "section",
            "data": section
        }
        
        if "subsections" in section:
            for subsection in section["subsections"]:
                subsection_id = subsection["id"]
                index[subsection_id] = {
                    "type": "subsection",
                    "data": subsection,
                    "parent_id": section_id
                }
                
                if "items" in subsection:
                    for item in subsection["items"]:
                        item_id = item["id"]
                        index[item_id] = {
                            "type": "item",
                            "data": item,
                            "parent_id": subsection_id
                        }
                        
                        # If item has defects, index them for easier lookup
                        if "defects" in item and item["defects"]:
                            for i, defect in enumerate(item["defects"]):
                                defect_key = f"{item_id}_defect_{i}"
                                index[defect_key] = {
                                    "type": "defect",
                                    "data": defect,
                                    "parent_id": item_id,
                                    "index": i
                                }
    
    logger.info(f"Built index with {len(index)} entries")
    # Log index structure statistics
    type_counts = {}
    for entry in index.values():
        entry_type = entry["type"]
        type_counts[entry_type] = type_counts.get(entry_type, 0) + 1
    
    logger.info(f"Index structure: {type_counts}")
    return index

# Load data at startup
@app.on_event("startup")
async def startup_event():
    global MOT_MANUAL_DATA, MOT_MANUAL_INDEX
    MOT_MANUAL_DATA = load_mot_manual()
    MOT_MANUAL_INDEX = build_index(MOT_MANUAL_DATA)
    logger.info("API started and data indexed successfully")

# API routes
@app.get("/")
async def root():
    """Root endpoint - basic API info"""
    return {
        "name": "MOT Manual API",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/manual/section/{section_id}",
            "/api/v1/manual/subsection/{subsection_id}",
            "/api/v1/manual/item/{item_id}",
            "/api/v1/manual/search/{query}"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    if not MOT_MANUAL_DATA or not MOT_MANUAL_INDEX:
        return {"status": "unhealthy", "error": "Data not loaded or indexed"}
    return {"status": "healthy", "version": "1.0.0", "index_size": len(MOT_MANUAL_INDEX)}

@app.get("/api/v1/manual/all")
async def get_full_manual():
    """Return the complete MOT manual data"""
    if not MOT_MANUAL_DATA:
        raise HTTPException(status_code=500, detail="MOT manual data not loaded")
    return MOT_MANUAL_DATA

@app.get("/api/v1/manual/section/{section_id}")
async def get_section(section_id: str):
    """Get a specific section by ID"""
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
        
    if section_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[section_id]["type"] == "section":
        return MOT_MANUAL_INDEX[section_id]["data"]
    raise HTTPException(status_code=404, detail=f"Section {section_id} not found")

@app.get("/api/v1/manual/subsection/{subsection_id}")
async def get_subsection(subsection_id: str):
    """Get a specific subsection by ID"""
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
        
    if subsection_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[subsection_id]["type"] == "subsection":
        return MOT_MANUAL_INDEX[subsection_id]["data"]
    raise HTTPException(status_code=404, detail=f"Subsection {subsection_id} not found")

@app.get("/api/v1/manual/item/{item_id}")
async def get_item(item_id: str):
    """Get a specific item by ID"""
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
        
    if item_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[item_id]["type"] == "item":
        item_data = MOT_MANUAL_INDEX[item_id]["data"]
        parent_id = MOT_MANUAL_INDEX[item_id]["parent_id"]
        
        # Get parent subsection title for context
        parent_title = ""
        if parent_id in MOT_MANUAL_INDEX:
            parent_title = MOT_MANUAL_INDEX[parent_id]["data"]["title"]
        
        # Get grandparent (section) info
        section_id = ""
        section_title = ""
        if parent_id in MOT_MANUAL_INDEX and "parent_id" in MOT_MANUAL_INDEX[parent_id]:
            section_id = MOT_MANUAL_INDEX[parent_id]["parent_id"]
            if section_id in MOT_MANUAL_INDEX:
                section_title = MOT_MANUAL_INDEX[section_id]["data"]["title"]
        
        return {
            "item": item_data,
            "parent_id": parent_id,
            "parent_title": parent_title,
            "section_id": section_id,
            "section_title": section_title
        }
    raise HTTPException(status_code=404, detail=f"Item {item_id} not found")

@app.get("/api/v1/manual/search/{query}")
async def search_manual(query: str):
    """Search the MOT manual for matching content"""
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
        
    query = query.lower()
    results = []
    
    for id, entry in MOT_MANUAL_INDEX.items():
        # Skip defect entries - we'll find them through their parent items
        if entry["type"] == "defect":
            continue
            
        item_type = entry["type"]
        data = entry["data"]
        
        # Search in title
        if "title" in data and query in data["title"].lower():
            results.append({
                "id": id,
                "type": item_type,
                "title": data["title"],
                "match_type": "title"
            })
            continue
        
        # Search in description
        if "description" in data and data["description"] and query in data["description"].lower():
            results.append({
                "id": id,
                "type": item_type,
                "title": data["title"],
                "match_type": "description"
            })
            continue
        
        # Search in defects (for items)
        if item_type == "item" and "defects" in data and data["defects"]:
            for i, defect in enumerate(data["defects"]):
                if "description" in defect and query in defect["description"].lower():
                    results.append({
                        "id": id,
                        "type": item_type,
                        "title": data["title"],
                        "match_type": f"defect_{i}",
                        "defect": defect["description"],
                        "category": defect.get("category", "")
                    })
    
    return {"results": results, "count": len(results)}

@app.get("/api/v1/manual/defect/{defect_id}")
async def get_defect_info(defect_id: str):
    """
    Get detailed information about a specific defect by ID.
    The defect_id can be in formats like "1.1.1" or partial like "1.1".
    """
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
        
    # Try exact match first
    if defect_id in MOT_MANUAL_INDEX:
        entry = MOT_MANUAL_INDEX[defect_id]
        return {
            "id": defect_id,
            "type": entry["type"],
            "data": entry["data"],
            "path": get_item_path(defect_id)
        }
    
    # Try partial match (prefix search)
    matches = []
    for id, entry in MOT_MANUAL_INDEX.items():
        # Skip defect entries for this search
        if entry["type"] == "defect":
            continue
            
        if id.startswith(defect_id):
            matches.append({
                "id": id,
                "type": entry["type"],
                "title": entry["data"]["title"],
                "data": entry["data"],
                "path": get_item_path(id)
            })
    
    if matches:
        return {"matches": matches, "count": len(matches)}
    
    raise HTTPException(status_code=404, detail=f"Defect {defect_id} not found")

def get_item_path(item_id):
    """Build the full path from section to the specific item"""
    if item_id not in MOT_MANUAL_INDEX:
        return []
    
    path = []
    current_id = item_id
    
    # Follow parent links until we reach the top
    while current_id:
        entry = MOT_MANUAL_INDEX.get(current_id)
        if not entry:
            break
        
        path.append({
            "id": current_id,
            "type": entry["type"],
            "title": entry["data"]["title"] if "title" in entry["data"] else "Unknown"
        })
        
        current_id = entry.get("parent_id", None)
    
    # Reverse to get the path from top to bottom
    return list(reversed(path))

# New endpoints for debugging and validation
@app.get("/api/v1/debug/index-stats")
async def get_index_stats():
    """Get statistics about the index for debugging"""
    if not MOT_MANUAL_INDEX:
        raise HTTPException(status_code=500, detail="MOT manual index not built")
    
    type_counts = {}
    for entry in MOT_MANUAL_INDEX.values():
        entry_type = entry["type"]
        type_counts[entry_type] = type_counts.get(entry_type, 0) + 1
    
    # ID pattern stats
    id_patterns = {
        "single_digit": 0,  # For sections (e.g., "1")
        "double_digit": 0,   # For subsections (e.g., "1.1")
        "triple_digit": 0,   # For items (e.g., "1.1.1")
        "other": 0           # Any other pattern
    }
    
    for id in MOT_MANUAL_INDEX.keys():
        if id.count(".") == 0 and id.isdigit():
            id_patterns["single_digit"] += 1
        elif id.count(".") == 1 and all(part.isdigit() for part in id.split(".")):
            id_patterns["double_digit"] += 1
        elif id.count(".") == 2 and all(part.isdigit() for part in id.split(".")):
            id_patterns["triple_digit"] += 1
        else:
            id_patterns["other"] += 1
    
    return {
        "total_entries": len(MOT_MANUAL_INDEX),
        "entry_types": type_counts,
        "id_patterns": id_patterns
    }

@app.get("/api/v1/debug/validate-structure")
async def validate_structure():
    """Validate the structure of the loaded MOT manual data"""
    if not MOT_MANUAL_DATA:
        raise HTTPException(status_code=500, detail="MOT manual data not loaded")
    
    issues = []
    
    # Check section-subsection-item hierarchy
    for section in MOT_MANUAL_DATA["sections"]:
        section_id = section["id"]
        
        if "subsections" not in section:
            issues.append(f"Section {section_id} has no subsections")
            continue
        
        for subsection in section["subsections"]:
            subsection_id = subsection["id"]
            
            # Check subsection ID format
            if not subsection_id.startswith(f"{section_id}."):
                issues.append(f"Subsection ID {subsection_id} does not follow expected format {section_id}.X")
            
            if "items" not in subsection:
                issues.append(f"Subsection {subsection_id} has no items")
                continue
            
            for item in subsection["items"]:
                item_id = item["id"]
                
                # Check item ID format
                if not item_id.startswith(f"{subsection_id}."):
                    issues.append(f"Item ID {item_id} does not follow expected format {subsection_id}.X")
    
    if issues:
        return {"valid": False, "issues": issues}
    else:
        return {"valid": True}

# Main entry point for development server
if __name__ == "__main__":
    import uvicorn
    # Bind to localhost only for development
    uvicorn.run("app:app", host="127.0.0.1", port=8002, reload=True)