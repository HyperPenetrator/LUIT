from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.location_service import check_duplicate_location

router = APIRouter(prefix="/location", tags=["location"])

class CheckDuplicateRequest(BaseModel):
    latitude: float
    longitude: float
    radius: int = 100

@router.post("/check-duplicate")
async def check_duplicate(request: CheckDuplicateRequest):
    """Check if location has active reports within radius"""
    try:
        result = await check_duplicate_location(request.latitude, request.longitude, request.radius)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/nearby-reports")
async def get_nearby_reports(latitude: float, longitude: float, radius: int = 100):
    """Get all reports within radius (in meters)"""
    try:
        # Query Firebase for nearby reports
        return {"reports": []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/validate-coordinates")
async def validate_coordinates(latitude: float, longitude: float):
    """Validate if coordinates are valid"""
    try:
        if -90 <= latitude <= 90 and -180 <= longitude <= 180:
            return {"valid": True}
        else:
            return {"valid": False, "message": "Invalid coordinates"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
