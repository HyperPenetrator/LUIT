import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import get_firestore_client, add_document
from google.cloud.firestore import GeoPoint

def seed_data():
    db = get_firestore_client()
    print("🚀 Seeding LUIT Water Contamination Data for Guwahati...")

    # Guwahati Center approx: 26.1158, 91.7086
    guwahati_locations = [
        {"name": "Dispur", "lat": 26.1433, "lon": 91.7898},
        {"name": "Paltan Bazaar", "lat": 26.1750, "lon": 91.7539},
        {"name": "Maligaon", "lat": 26.1558, "lon": 91.7050},
        {"name": "Hatigaon", "lat": 26.1250, "lon": 91.7800},
        {"name": "Uzan Bazaar", "lat": 26.1880, "lon": 91.7550},
        {"name": "Basistha", "lat": 26.1050, "lon": 91.7850},
        {"name": "Azara", "lat": 26.1150, "lon": 91.6050},
    ]

    # 1. Seed waterReports
    print("📝 Seeding waterReports...")
    for loc in guwahati_locations:
        report = {
            "location": GeoPoint(loc["lat"], loc["lon"]),
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "village": loc["name"],
            "contaminationType": random.choice(["arsenic", "fluoride", "bacteria", "turbidity"]),
            "waterSource": random.choice(["tubewell", "pond", "tap"]),
            "severityLevel": random.choice(["caution", "unsafe", "critical"]),
            "description": f"Concerned about water quality in {loc['name']}",
            "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            "reportedBy": "system_gen",
            "userName": "System User",
            "reportedAt": (datetime.now() - timedelta(days=random.randint(0, 5))).isoformat(),
            "affectedPopulation": random.randint(50, 500),
            "status": "pending",
            "verified": False,
            "testResults": None
        }
        add_document("waterReports", report)

    # 2. Seed alerts
    print("🚨 Seeding alerts...")
    alert = {
        "triggerType": "automatic",
        "contaminationType": "arsenic",
        "affectedArea": {
            "center": GeoPoint(26.1433, 91.7898),
            "radius": 5000
        },
        "latitude": 26.1433,
        "longitude": 91.7898,
        "severityLevel": "critical",
        "message": "High levels of Arsenic detected in Dispur area. Use alternative sources.",
        "reportIds": [],
        "createdAt": datetime.now().isoformat(),
        "createdBy": "system",
        "status": "active",
        "affectedUsers": [],
        "notificationsSent": 150
    }
    add_document("alerts", alert)

    # 3. Seed testingLabs
    print("🔬 Seeding testingLabs...")
    labs = [
        {
            "name": "Guwahati Public Health Laboratory",
            "location": GeoPoint(26.1850, 91.7500),
            "address": "Bamunimaidam, Guwahati",
            "contact": {"phone": "0361-2550123", "email": "lab@assam.gov.in"},
            "testsOffered": ["arsenic", "fluoride", "bacteria", "turbidity"],
            "operatingHours": "9 AM - 5 PM",
            "governmentApproved": True
        },
        {
            "name": "Regional Water Quality Testing Center",
            "location": GeoPoint(26.1400, 91.7900),
            "address": "Dispur, Guwahati",
            "contact": {"phone": "0361-2260456", "email": "regional_lab@assam.gov.in"},
            "testsOffered": ["bacteria", "turbidity", "iron"],
            "operatingHours": "10 AM - 4 PM",
            "governmentApproved": True
        }
    ]
    for lab in labs:
        add_document("testingLabs", lab)

    # 4. Seed safeSources
    print("💧 Seeding safeSources...")
    sources = [
        {
            "location": GeoPoint(26.1500, 91.7300),
            "sourceType": "Community Deep Tubewell",
            "verifiedBy": "Public Health Engineering Dept",
            "lastTestedDate": datetime.now().isoformat(),
            "testResults": {"arsenic": 0.005, "bacteria": "absent"},
            "status": "safe"
        }
    ]
    for s in sources:
        add_document("safeSources", s)

    # 5. Seed treatmentGuidance
    print("📚 Seeding treatmentGuidance...")
    guidance = [
        {
            "contaminationType": "bacteria",
            "severity": "high",
            "immediateActions": ["Boil water at least 1 minute", "Use chlorine tablets"],
            "homeRemedies": ["Solar water disinfection (SODIS)", "Sand filters"],
            "whenToSeekHelp": "If experiencing diarrhea, vomiting, or stomach pain.",
            "emergencyContacts": ["108 (Ambulance)", "104 (Health Helpline)"],
            "language": "en"
        },
        {
            "contaminationType": "arsenic",
            "severity": "critical",
            "immediateActions": ["Stop drinking contaminated water immediately", "Seek alternate source"],
            "homeRemedies": ["Use Arsenic Removal Filter", "Rainwater harvesting"],
            "whenToSeekHelp": "If you notice skin pigmentation changes or lesions.",
            "emergencyContacts": ["District Collector Office"],
            "language": "en"
        }
    ]
    for g in guidance:
        add_document("treatmentGuidance", g)

    print("✅ Seeding completed!")

if __name__ == "__main__":
    seed_data()
