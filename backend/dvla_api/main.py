from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Vehicle Information Service")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models based on the API documentation
class VehicleRequest(BaseModel):
    registrationNumber: str

class VehicleResponse(BaseModel):
    registrationNumber: str
    taxStatus: str = None
    taxDueDate: str = None
    artEndDate: str = None
    motStatus: str = None
    motExpiryDate: str = None
    make: str = None
    monthOfFirstDvlaRegistration: str = None
    monthOfFirstRegistration: str = None
    yearOfManufacture: int = None
    engineCapacity: int = None
    co2Emissions: int = None
    fuelType: str = None
    markedForExport: bool = None
    colour: str = None
    typeApproval: str = None
    wheelplan: str = None
    revenueWeight: int = None
    realDrivingEmissions: str = None
    dateOfLastV5CIssued: str = None
    euroStatus: str = None
    automatedVehicle: bool = None

# Get API key from environment variable
API_KEY = os.getenv("DVLA_API_KEY")
if not API_KEY:
    print("Warning: DVLA_API_KEY environment variable not set")

# API endpoint
DVLA_API_URL = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles"

@app.post("/api/vehicle", response_model=VehicleResponse)
async def get_vehicle_info(request: VehicleRequest):
    # Validate API key
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    # Prepare headers
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Prepare request body
    payload = {"registrationNumber": request.registrationNumber}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DVLA_API_URL,
                json=payload,
                headers=headers
            )
        
        # Handle error responses
        if response.status_code != 200:
            error_data = response.json()
            # Extract error details from the response if available
            error_detail = "Unknown error"
            if "errors" in error_data and len(error_data["errors"]) > 0:
                error_detail = error_data["errors"][0].get("detail", "Unknown error")
            
            # Map common status codes to appropriate messages
            if response.status_code == 400:
                raise HTTPException(status_code=400, detail=f"Bad request: {error_detail}")
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            else:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Error from DVLA API: {error_detail}"
                )
        
        # Return the vehicle data
        return response.json()
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

# Run the application on port 8004
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)