from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
from services.firebase_service import add_document, get_document, query_documents, update_document
from datetime import datetime
from google.cloud.firestore import GeoPoint

router = APIRouter(prefix="/alerts", tags=["alerts"])

class AlertResponse(BaseModel):
    alertId: str
    contaminationType: str
    severityLevel: str
    message: str
    status: str
    latitude: float
    longitude: float
    createdAt: str

@router.get("/")
async def get_alerts(status: str = "active"):
    """Get active alerts"""
    try:
        alerts = query_documents("alerts", "status", "==", status)
        return {"success": True, "alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{alertId}")
async def get_alert(alertId: str):
    """Get specific alert details"""
    try:
        alert = get_document("alerts", alertId)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        alert['id'] = alertId
        return {"success": True, "alert": alert}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{alertId}/status")
async def update_alert_status(alertId: str, status: Literal["active", "dismissed", "resolved"]):
    """Update alert status (for health agents)"""
    try:
        update_document("alerts", alertId, {"status": status, "updatedAt": datetime.now().isoformat()})
        return {"success": True, "message": f"Alert status updated to {status}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
