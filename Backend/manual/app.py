import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    subItems: Optional[List[Dict[str, Any]]] = None

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
MOT_MANUAL_FILE = os.environ.get("MOT_MANUAL_FILE", "mot_manual.json")

def load_mot_manual():
    global MOT_MANUAL_DATA
    try:
        with open(MOT_MANUAL_FILE, 'r') as f:
            data = json.load(f)
            MOT_MANUAL_DATA = data
            logger.info(f"Successfully loaded MOT manual data from {MOT_MANUAL_FILE}")
            return data
    except Exception as e:
        logger.error(f"Failed to load MOT manual data: {str(e)}")
        raise

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
    
    return index

# Load data at startup
@app.on_event("startup")
async def startup_event():
    global MOT_MANUAL_DATA
    MOT_MANUAL_DATA = load_mot_manual()
    global MOT_MANUAL_INDEX
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
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/v1/manual/all")
async def get_full_manual():
    """Return the complete MOT manual data"""
    if not MOT_MANUAL_DATA:
        raise HTTPException(status_code=500, detail="MOT manual data not loaded")
    return MOT_MANUAL_DATA

@app.get("/api/v1/manual/section/{section_id}")
async def get_section(section_id: str):
    """Get a specific section by ID"""
    if section_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[section_id]["type"] == "section":
        return MOT_MANUAL_INDEX[section_id]["data"]
    raise HTTPException(status_code=404, detail=f"Section {section_id} not found")

@app.get("/api/v1/manual/subsection/{subsection_id}")
async def get_subsection(subsection_id: str):
    """Get a specific subsection by ID"""
    if subsection_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[subsection_id]["type"] == "subsection":
        return MOT_MANUAL_INDEX[subsection_id]["data"]
    raise HTTPException(status_code=404, detail=f"Subsection {subsection_id} not found")

@app.get("/api/v1/manual/item/{item_id}")
async def get_item(item_id: str):
    """Get a specific item by ID"""
    if item_id in MOT_MANUAL_INDEX and MOT_MANUAL_INDEX[item_id]["type"] == "item":
        item_data = MOT_MANUAL_INDEX[item_id]["data"]
        parent_id = MOT_MANUAL_INDEX[item_id]["parent_id"]
        
        # Get parent subsection title for context
        parent_title = ""
        if parent_id in MOT_MANUAL_INDEX:
            parent_title = MOT_MANUAL_INDEX[parent_id]["data"]["title"]
        
        return {
            "item": item_data,
            "parent_id": parent_id,
            "parent_title": parent_title
        }
    raise HTTPException(status_code=404, detail=f"Item {item_id} not found")

@app.get("/api/v1/manual/search/{query}")
async def search_manual(query: str):
    """Search the MOT manual for matching content"""
    query = query.lower()
    results = []
    
    for id, entry in MOT_MANUAL_INDEX.items():
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
                        "defect": defect["description"]
                    })
    
    return {"results": results}

@app.get("/api/v1/manual/defect/{defect_id}")
async def get_defect_info(defect_id: str):
    """
    Get detailed information about a specific defect by ID.
    The defect_id can be in formats like "1.1.1" or partial like "1.1".
    """
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
        if id.startswith(defect_id):
            matches.append({
                "id": id,
                "type": entry["type"],
                "title": entry["data"]["title"],
                "data": entry["data"],
                "path": get_item_path(id)
            })
    
    if matches:
        return {"matches": matches}
    
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
            "title": entry["data"]["title"]
        })
        
        current_id = entry.get("parent_id", None)
    
    # Reverse to get the path from top to bottom
    return list(reversed(path))

# Main entry point for development server
if __name__ == "__main__":
    import uvicorn
    # Bind to localhost only for development
    uvicorn.run("app:app", host="127.0.0.1", port=8002, reload=True)