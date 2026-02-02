import logging
from datetime import datetime, timedelta
from services.firebase_service import add_document, get_firestore_client, update_document
from services.utils import haversine_distance
from google.cloud.firestore import FieldFilter, GeoPoint

logger = logging.getLogger(__name__)

# Constants for rules
CLUSTER_THRESHOLD = 3
CLUSTER_RADIUS = 5000  # 5km
ARSENIC_RADIUS = 2000  # 2km
TIME_WINDOW_HOURS = 24

async def check_and_trigger_alerts(new_report: dict):
    """
    Check if a new report triggers an alert based on rules.
    1. 3+ reports of same contamination within 5km in 24h.
    2. Severity 'critical' triggers immediate alert.
    3. Arsenic triggers immediate alert (2km radius).
    4. Bacteria in water source (handled by same cluster logic for now).
    """
    try:
        db = get_firestore_client()
        contamination_type = new_report.get("contaminationType")
        severity = new_report.get("severityLevel")
        lat = new_report.get("latitude")
        lon = new_report.get("longitude")
        
        if not contamination_type or lat is None or lon is None:
            return None

        triggered_rule = None
        alert_radius = CLUSTER_RADIUS
        
        # Rule 2: IF severity = "critical" -> Immediate alert
        if severity == "critical":
            triggered_rule = "Rule 2: Critical Severity"
            alert_radius = 5000 # Default critical radius
            
        # Rule 3: IF arsenic detected -> Alert all users within 2km radius
        elif contamination_type == "arsenic":
            triggered_rule = "Rule 3: Arsenic Detected"
            alert_radius = ARSENIC_RADIUS

        # Cluster Rule: IF 3+ reports of same type within 5km in 24h
        if not triggered_rule:
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
                if r_lat is not None and r_lon is not None:
                    dist = haversine_distance(lat, lon, r_lat, r_lon)
                    if dist <= CLUSTER_RADIUS:
                        nearby_reports.append(doc.id)
            
            if len(nearby_reports) >= CLUSTER_THRESHOLD:
                triggered_rule = f"Rule 1: {len(nearby_reports)} Reports Cluster"
                alert_radius = CLUSTER_RADIUS

        if triggered_rule:
            # Check for existing active alert in that area to avoid duplicates
            alerts_ref = db.collection("alerts")
            active_alerts = alerts_ref.where(filter=FieldFilter("contaminationType", "==", contamination_type)) \
                                     .where(filter=FieldFilter("status", "==", "active")).stream()
            
            for alert_doc in active_alerts:
                alert_data = alert_doc.to_dict()
                a_lat = alert_data.get("latitude")
                a_lon = alert_data.get("longitude")
                if a_lat is not None and a_lon is not None:
                    if haversine_distance(lat, lon, a_lat, a_lon) <= alert_radius:
                        logger.info(f"ℹ️  Duplicate alert exists: {alert_doc.id}")
                        return alert_doc.id

            # Create new alert
            alert_data = {
                "triggerType": "automatic",
                "triggeredBy": triggered_rule,
                "contaminationType": contamination_type,
                "affectedArea": {
                    "center": GeoPoint(lat, lon),
                    "radius": alert_radius
                },
                "latitude": lat,
                "longitude": lon,
                "severityLevel": severity or "unsafe",
                "message": generate_alert_message(contamination_type, triggered_rule),
                "createdAt": datetime.now().isoformat(),
                "status": "active",
                "affectedUsers": [],
                "notificationsSent": 0,
                "verified": False
            }
            
            alert_id = add_document("alerts", alert_data)
            logger.info(f"🚨 ALERT TRIGGERED: {alert_id} via {triggered_rule}")
            
            # Simulate notifications
            send_mock_notifications(alert_data)
            
            return alert_id
            
    except Exception as e:
        logger.error(f"❌ Error in alert engine: {str(e)}")
        return None

def generate_alert_message(contamination, rule):
    if "Arsenic" in rule:
        return f"URGENT: Arsenic detected in your area. Avoid using groundwater for drinking or cooking until tested. Check LUIT for safe sources."
    if "Critical" in rule:
        return f"CRITICAL: Severe water contamination reported. Use only verified safe water sources immediately."
    return f"ALERT: A cluster of {contamination} reports detected. Increased risk of water contamination in this area."

def send_mock_notifications(alert):
    logger.info(f"📱 MOCK SMS: [LUIT] {alert['message']} (Radius: {alert['affectedArea']['radius']}m)")
    logger.info(f"🔔 MOCK PUSH: Alert triggered for {alert['contaminationType']} near your location.")
