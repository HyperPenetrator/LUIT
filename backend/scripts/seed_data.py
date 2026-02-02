from services.firebase_service import init_firebase, get_firestore_client, add_document
from google.cloud.firestore import GeoPoint
from datetime import datetime, timedelta
import random

def seed_demo_data():
    db = get_firestore_client()
    print("🚀 Seeding Majuli Demo Data...")

    # 1. Testing Labs
    labs = [
        {
            "name": "Majuli District Water Testing Lab",
            "location": GeoPoint(26.9550, 94.2200),
            "address": "Kamalabari, Majuli, Assam 785104",
            "contact": {"phone": "+91-3775-274001", "email": "majuli.waterlab@assam.gov.in"},
            "testsOffered": ["arsenic", "fluoride", "bacteria", "turbidity", "pH", "iron"],
            "operatingHours": "Mon-Sat 9:00 AM - 5:00 PM",
            "governmentApproved": True,
            "capacity": "High", "waitTime": "2-3 days"
        },
        {
            "name": "PHED Mobile Testing Unit - Majuli",
            "location": GeoPoint(26.9612, 94.2289),
            "address": "Garamur, Majuli (Mobile Unit)",
            "contact": {"phone": "+91-3775-274002"},
            "testsOffered": ["arsenic", "fluoride", "bacteria", "turbidity"],
            "operatingHours": "Tue, Thu, Sat 10:00 AM - 2:00 PM",
            "governmentApproved": True,
            "capacity": "Medium", "waitTime": "Same day"
        }
    ]
    for lab in labs:
        db.collection("testingLabs").add(lab)

    # 2. Safe Sources
    sources = [
        {
            "name": "Kamalabari Community Deep Tubewell",
            "location": GeoPoint(26.9480, 94.2150),
            "type": "tubewell",
            "lastTested": datetime.now().isoformat(),
            "results": {"arsenic": "safe", "bacteria": "safe"},
            "isGovernmentVerified": True
        },
        {
            "name": "Garamur Satra Water Filter Plant",
            "location": GeoPoint(26.9650, 94.2250),
            "type": "plant",
            "lastTested": datetime.now().isoformat(),
            "results": {"arsenic": "safe", "bacteria": "safe"},
            "isGovernmentVerified": True
        }
    ]
    for s in sources:
        db.collection("safeSources").add(s)

    # 3. Treatment Guidance
    guidances = [
        {
            "contaminationType": "arsenic", "language": "en",
            "immediateActions": ["Stop drinking immediately", "Do not use for cooking"],
            "homeTreatment": "Use government-approved filters. Boiling does NOT help.",
            "medicalAdvice": "Check for skin lesions."
        },
        {
            "contaminationType": "bacteria", "language": "en",
            "immediateActions": ["Boil water vigorously", "Use chlorination"],
            "homeTreatment": "Boil for 10 minutes or use UV purification.",
            "medicalAdvice": "Seek help for severe diarrhea."
        }
    ]
    for g in guidances:
        db.collection("treatmentGuidance").add(g)

    # 4. Water Reports (Demo Cluster)
    # Kamalabari Arsenic Cluster (3 reports)
    for i in range(3):
        report = {
            "village": "Kamalabari",
            "contaminationType": "arsenic",
            "waterSource": "tubewell",
            "severityLevel": "unsafe",
            "latitude": 26.9500 + (random.random() * 0.01),
            "longitude": 94.2200 + (random.random() * 0.01),
            "reportedAt": (datetime.now() - timedelta(hours=i*2)).isoformat(),
            "status": "pending",
            "userName": f"Villager {i+1}",
            "location": GeoPoint(26.9500, 94.2200)
        }
        db.collection("waterReports").add(report)

    # Garamur Fluoride (2 reports)
    for i in range(2):
        report = {
            "village": "Garamur",
            "contaminationType": "fluoride",
            "waterSource": "well",
            "severityLevel": "caution",
            "latitude": 26.9600 + (random.random() * 0.01),
            "longitude": 94.2300 + (random.random() * 0.01),
            "reportedAt": datetime.now().isoformat(),
            "status": "pending",
            "userName": f"Resident {i+1}"
        }
        db.collection("waterReports").add(report)

    # Auniati Bacteria (1 critical)
    db.collection("waterReports").add({
        "village": "Auniati",
        "contaminationType": "bacteria",
        "waterSource": "pond",
        "severityLevel": "critical",
        "latitude": 26.9300,
        "longitude": 94.2000,
        "reportedAt": datetime.now().isoformat(),
        "status": "pending",
        "userName": "Concerned Citizen"
    })

    # 5. Pre-triggered Alerts
    db.collection("alerts").add({
        "contaminationType": "arsenic",
        "severityLevel": "critical",
        "status": "active",
        "village": "Kamalabari",
        "message": "URGENT: Arsenic cluster detected in Kamalabari. Avoid groundwater.",
        "latitude": 26.9500,
        "longitude": 94.2200,
        "affectedArea": {"center": GeoPoint(26.9500, 94.2200), "radius": 5000},
        "createdAt": datetime.now().isoformat(),
        "triggerType": "automatic"
    })

    print("✅ Seeding Complete!")

if __name__ == "__main__":
    init_firebase()
    seed_demo_data()
