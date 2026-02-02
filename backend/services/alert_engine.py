import logging
from datetime import datetime, timedelta
from services.firebase_service import add_document, get_firestore_client
from services.utils import haversine_distance
from google.cloud.firestore import FieldFilter

logger = logging.getLogger(__name__)

ALERT_RADIUS_METERS = 5000  # 5km
REPORT_THRESHOLD = 3
TIME_WINDOW_HOURS = 72  # Look back 72 hours for clusters

from google.cloud.firestore import GeoPoint

async def check_and_trigger_alerts(new_report: dict):
    """
    Check if a new report triggers an alert cluster.
    Rule: 3+ reports of the same contaminationType within 5km in the last 72h.
    """
    try:
        db = get_firestore_client()
        contamination_type = new_report.get("contaminationType")
        lat = new_report.get("latitude")
        lon = new_report.get("longitude")
        
        if not contamination_type or lat is None or lon is None:
            return
            
        # Get reports of same contaminationType in last 72h
        since_time = datetime.now() - timedelta(hours=TIME_WINDOW_HOURS)
        reports_ref = db.collection("waterReports")
        query = reports_ref.where(filter=FieldFilter("contaminationType", "==", contamination_type)) \
                          .where(filter=FieldFilter("reportedAt", ">", since_time.isoformat()))
        
        docs = query.stream()
        nearby_reports = []
        
        for doc in docs:
            data = doc.to_dict()
            r_lat = data.get("latitude")
            r_lon = data.get("longitude")
            
            if r_lat is None or r_lon is None:
                continue
                
            dist = haversine_distance(lat, lon, r_lat, r_lon)
            if dist <= ALERT_RADIUS_METERS:
                nearby_reports.append(doc.id)
        
        logger.info(f"🔍 Found {len(nearby_reports)} nearby reports for contaminationType '{contamination_type}'")
        
        if len(nearby_reports) >= REPORT_THRESHOLD:
            # Check if an active alert already exists for this cluster
            alerts_ref = db.collection("alerts")
            active_alerts = alerts_ref.where(filter=FieldFilter("contaminationType", "==", contamination_type)) \
                                     .where(filter=FieldFilter("status", "==", "active")).stream()
            
            duplicate_alert = False
            for alert_doc in active_alerts:
                alert_data = alert_doc.to_dict()
                # Use flat lat/lon for distance check (easier than GeoPoint extracting)
                a_lat = alert_data.get("latitude")
                a_lon = alert_data.get("longitude")
                if a_lat is not None and a_lon is not None:
                    if haversine_distance(lat, lon, a_lat, a_lon) <= ALERT_RADIUS_METERS:
                        duplicate_alert = True
                        break
            
            if not duplicate_alert:
                alert_data = {
                    "triggerType": "automatic",
                    "contaminationType": contamination_type,
                    "affectedArea": {
                        "center": GeoPoint(lat, lon),
                        "radius": ALERT_RADIUS_METERS
                    },
                    "latitude": lat, # Flat fields for easier queries
                    "longitude": lon,
                    "severityLevel": new_report.get("severityLevel", "unsafe"),
                    "message": f"Alert: Potential {contamination_type} contamination cluster detected in this area.",
                    "reportIds": nearby_reports,
                    "createdAt": datetime.now().isoformat(),
                    "createdBy": "system",
                    "status": "active",
                    "affectedUsers": [],
                    "notificationsSent": 0
                }
                alert_id = add_document("alerts", alert_data)
                logger.info(f"🚨 ALERT TRIGGERED: {alert_id} for {contamination_type}")
                return alert_id
                
    except Exception as e:
        logger.error(f"❌ Error in alert engine: {str(e)}")
        return None
