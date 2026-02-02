from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from services.firebase_service import add_document, get_firestore_client
from services.alert_engine import check_and_trigger_alerts
from services.utils import haversine_distance
from datetime import datetime
from google.cloud.firestore import GeoPoint, FieldFilter

router = APIRouter(prefix="/sms", tags=["sms"])

class SMSRequest(BaseModel):
    phone: str
    message: str

@router.post("/simulate")
async def simulate_sms(request: SMSRequest):
    """
    Simulate incoming SMS and generate responsive alert SMS.
    Format: WATER <VILLAGE> <TYPE> <SOURCE>
    """
    msg = request.message.strip().upper()
    if not msg.startswith("WATER"):
        return {"success": False, "reply": "Invalid format. Use: WATER <VILLAGE> <TYPE> <SOURCE>"}

    parts = msg.split()
    if len(parts) < 4:
        return {"success": False, "reply": "Incomplete. Use: WATER <VILLAGE> <TYPE> <SOURCE>"}

    _, village, c_type, source = parts[0], parts[1], parts[2], parts[3]
    
    # Simple mapping
    c_type = c_type.lower()
    source = source.lower()
    village = village.capitalize()

    # Mock coordinates for Majuli demo based on village
    coords = {
        "Kamalabari": (26.9550, 94.2200),
        "Garamur": (26.9612, 94.2289),
        "Auniati": (26.9320, 94.1980),
        "Majuli": (26.9363, 94.1205)
    }
    lat, lon = coords.get(village, (26.9363, 94.1205))

    try:
        # Create report
        report_data = {
            "village": village,
            "contaminationType": c_type if c_type in ["arsenic", "fluoride", "bacteria", "turbidity", "other"] else "other",
            "waterSource": source if source in ["tubewell", "pond", "river", "tap", "well"] else "well",
            "severityLevel": "unsafe",
            "latitude": lat,
            "longitude": lon,
            "reportedAt": datetime.now().isoformat(),
            "reportedBy": f"sms_{request.phone}",
            "userName": f"SMS User ({request.phone[-4:]})",
            "status": "pending",
            "location": GeoPoint(lat, lon),
            "verified": False
        }
        
        report_id = add_document("waterReports", report_data)
        
        # Check alerts
        alert_id = await check_and_trigger_alerts(report_data)
        
        # Fetch nearest lab for outgoing SMS mock
        db = get_firestore_client()
        labs = db.collection("testingLabs").stream()
        nearest_lab = "Majuli District Lab"
        lab_phone = "+91-3775-274001"
        
        # Fetch nearest safe source
        sources = db.collection("safeSources").stream()
        nearest_source = "Deep Tubewell"
        
        reply = (
            f"⚠️ LUIT CONFIRMATION\n"
            f"Report {report_id} received for {village}.\n"
            f"Recommended Action: Boil water before use.\n"
            f"Nearest Lab: {nearest_lab} ({lab_phone})"
        )
        
        return {
            "success": True,
            "reportId": report_id,
            "reply": reply,
            "alertTriggered": bool(alert_id)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
