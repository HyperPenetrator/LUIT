from fastapi import APIRouter, HTTPException
from services.firebase_service import get_firestore_client, update_document
from google.cloud.firestore import FieldFilter
from datetime import datetime, timedelta

router = APIRouter(prefix="/health-agent", tags=["health-agent"])

@router.get("/dashboard")
async def get_health_agent_dashboard():
    """Get all data needed for the health agent dashboard overview"""
    try:
        db = get_firestore_client()
        
        # 1. Fetch Reports
        reports_docs = db.collection("waterReports").order_by("reportedAt", direction="DESCENDING").stream()
        reports = []
        pending_count = 0
        for doc in reports_docs:
            d = doc.to_dict()
            d['id'] = doc.id
            if not d.get('verified', False):
                pending_count += 1
            reports.append(d)

        # 2. Fetch Alerts
        alerts_docs = db.collection("alerts").where(filter=FieldFilter("status", "==", "active")).stream()
        active_alerts = []
        total_affected = 0
        for doc in alerts_docs:
            d = doc.to_dict()
            d['id'] = doc.id
            total_affected += len(d.get('affectedUsers', []))
            active_alerts.append(d)

        # 3. Analytics Data
        # Contamination Breakdown
        contamination_stats = {}
        for r in reports:
            ctype = r.get('contaminationType', 'other')
            contamination_stats[ctype] = contamination_stats.get(ctype, 0) + 1
            
        # 4. Fetch Labs and Safe Sources
        labs_docs = db.collection("testingLabs").stream()
        labs = [{"id": l.id, **l.to_dict()} for l in labs_docs]
        
        sources_docs = db.collection("safeSources").stream()
        sources = [{"id": s.id, **s.to_dict()} for s in sources_docs]

        return {
            "success": True,
            "summary": {
                "activeAlerts": len(active_alerts),
                "pendingVerification": pending_count,
                "totalAffected": total_affected,
                "totalReports": len(reports)
            },
            "reports": reports,
            "alerts": active_alerts,
            "labs": labs,
            "sources": sources,
            "analytics": {
                "contaminationBreakdown": contamination_stats
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-report/{report_id}")
async def verify_report(report_id: str, verified: bool):
    try:
        update_document("waterReports", report_id, {
            "verified": verified,
            "status": "verified" if verified else "dismissed",
            "verifiedAt": datetime.now().isoformat()
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/add-test-results")
async def add_lab_results(report_id: str, test_results: dict):
    try:
        update_document("waterReports", report_id, {
            "labResults": test_results,
            "status": "lab_confirmed",
            "updatedAt": datetime.now().isoformat()
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/log-action")
async def log_response_action(alert_id: str, action: dict):
    """Log an action taken for an alert (e.g. Tanker deployed)"""
    try:
        db = get_firestore_client()
        alert_ref = db.collection("alerts").document(alert_id)
        alert_ref.update({
            "responseActions": firestore.ArrayUnion([
                {**action, "timestamp": datetime.now().isoformat()}
            ])
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
