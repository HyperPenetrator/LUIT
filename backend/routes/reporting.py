from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional
from services.cloudinary_service import upload_image_to_cloudinary
from services.firebase_service import add_document, get_document, get_firestore_client
from services.alert_engine import check_and_trigger_alerts
from datetime import datetime
from google.cloud.firestore import GeoPoint

router = APIRouter(prefix="/reporting", tags=["reporting"])

class ReportRequest(BaseModel):
    latitude: float
    longitude: float
    village: str
    contaminationType: Literal["arsenic", "fluoride", "bacteria", "turbidity", "other"]
    waterSource: Literal["tubewell", "pond", "river", "tap", "well"]
    severityLevel: Literal["safe", "caution", "unsafe", "critical"]
    description: Optional[str] = None
    imageBase64: Optional[str] = None
    imageUrl: Optional[str] = None
    imagePublicId: Optional[str] = None
    reportedBy: Optional[str] = None # userId
    userName: Optional[str] = None
    affectedPopulation: Optional[int] = 0

class UploadImageRequest(BaseModel):
    image_base_64: str

@router.post("/upload-image")
async def upload_image(request: UploadImageRequest):
    """Upload image to Cloudinary immediately"""
    try:
        if not request.image_base_64:
            raise ValueError("No image data provided")
        
        result = await upload_image_to_cloudinary(request.image_base_64, folder="luit/water_reports")
        
        if not result['success']:
            raise ValueError(result['message'])
        
        return {
            "success": True,
            "url": result['url'],
            "public_id": result['public_id'],
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@router.post("/report")
async def create_report(request: ReportRequest):
    """Create new water contamination report according to new schema"""
    try:
        # Resolve image source
        image_url = request.imageUrl
        image_public_id = request.imagePublicId

        if not image_url and request.imageBase64:
            if request.imageBase64.startswith("http"):
                image_url = request.imageBase64
            else:
                upload_result = await upload_image_to_cloudinary(request.imageBase64, folder="luit/water_reports")
                if upload_result['success']:
                    image_url = upload_result['url']
                    image_public_id = upload_result['public_id']

        # Save to Firestore with new schema
        report_data = {
            "location": GeoPoint(request.latitude, request.longitude),
            "latitude": request.latitude, # keep flat for easy querying/UI
            "longitude": request.longitude,
            "village": request.village,
            "contaminationType": request.contaminationType,
            "waterSource": request.waterSource,
            "severityLevel": request.severityLevel,
            "description": request.description,
            "imageUrl": image_url,
            "imagePublicId": image_public_id,
            "reportedBy": request.reportedBy,
            "userName": request.userName or "Anonymous",
            "reportedAt": datetime.now().isoformat(),
            "affectedPopulation": request.affectedPopulation,
            "status": "pending",
            "verified": False,
            "testResults": None
        }
        
        # Add to Firestore
        report_id = add_document("waterReports", report_data)
        
        # Trigger alert engine
        alert_id = await check_and_trigger_alerts(report_data)
        
        return {
            "success": True,
            "message": "Report submitted successfully",
            "reportId": report_id,
            "alertTriggered": bool(alert_id),
            "alertId": alert_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports")
async def get_reports(contaminationType: str = None, limit: int = 20):
    """Get all reports according to new schema"""
    try:
        from services.firebase_service import query_documents
        if contaminationType:
            reports = query_documents("waterReports", "contaminationType", "==", contaminationType)
        else:
            reports = [] # needs better query
        
        return {"success": True, "reports": reports[:limit]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports/{reportId}")
async def get_report(reportId: str):
    """Get specific report details"""
    try:
        report = get_document("waterReports", reportId)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        report['id'] = reportId
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
