from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
from services.firebase_service import add_document, get_document, query_documents, update_document, get_firestore_client
from services.alert_engine import check_and_trigger_alerts
from services.utils import haversine_distance
from datetime import datetime
from google.cloud.firestore import GeoPoint, FieldFilter

router = APIRouter(prefix="/alerts", tags=["alerts"])

class ManualAlertRequest(BaseModel):
    latitude: float
    longitude: float
    contaminationType: str
    severityLevel: str
    message: str
    radius: int = 5000

@router.get("/active")
async def get_active_alerts(lat: Optional[float] = None, lon: Optional[float] = None, radius: int = 10000):
    """Get active alerts, optionally filtered by proximity"""
    try:
        db = get_firestore_client()
        docs = db.collection("alerts").where(filter=FieldFilter("status", "==", "active")).stream()
        
        alerts = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            
            # Distance filter if coordinates provided
            if lat is not None and lon is not None:
                a_lat = data.get("latitude")
                a_lon = data.get("longitude")
                if a_lat is not None and a_lon is not None:
                    dist = haversine_distance(lat, lon, a_lat, a_lon)
                    if dist <= radius:
                        data['distance'] = round(dist, 2)
                        alerts.append(data)
            else:
                alerts.append(data)
                
        return {"success": True, "alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create")
async def create_manual_alert(request: ManualAlertRequest):
    """Health agent creates manual alert"""
    try:
        alert_data = {
            "triggerType": "manual",
            "contaminationType": request.contaminationType,
            "severityLevel": request.severityLevel,
            "message": request.message,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "affectedArea": {
                "center": GeoPoint(request.latitude, request.longitude),
                "radius": request.radius
            },
            "createdAt": datetime.now().isoformat(),
            "status": "active",
            "verified": True,
            "createdBy": "health_agent"
        }
        alert_id = add_document("alerts", alert_data)
        return {"success": True, "alertId": alert_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str, reason: str):
    """Dismiss or resolve an alert"""
    try:
        update_document("alerts", alert_id, {
            "status": "dismissed", 
            "dismissReason": reason,
            "updatedAt": datetime.now().isoformat()
        })
        return {"success": True, "message": "Alert dismissed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alert_id}/affected")
async def mark_affected(alert_id: str, user_id: str):
    """Track users affected by alert"""
    try:
        db = get_firestore_client()
        doc_ref = db.collection("alerts").document(alert_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Alert not found")
            
        data = doc.to_dict()
        affected_users = data.get("affectedUsers", [])
        if user_id not in affected_users:
            affected_users.append(user_id)
            doc_ref.update({"affectedUsers": affected_users})
            
        return {"success": True, "count": len(affected_users)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{alert_id}")
async def get_alert(alert_id: str):
    try:
        alert = get_document("alerts", alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        alert['id'] = alert_id
        return {"success": True, "alert": alert}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
