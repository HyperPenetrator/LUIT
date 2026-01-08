#!/usr/bin/env python3
"""
Clear all reports and cleanings from Firestore
"""
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
except:
    pass  # Already initialized

db = firestore.client()

# Clear reports
print("🗑️  Clearing reports...")
reports = db.collection('reports').stream()
batch = db.batch()
count = 0
for doc in reports:
    batch.delete(doc.reference)
    count += 1
    if count % 500 == 0:
        batch.commit()
        batch = db.batch()
batch.commit()
print(f'✅ Deleted {count} reports')

# Clear cleanings
print("🗑️  Clearing cleanings...")
cleanings = db.collection('cleanings').stream()
batch = db.batch()
count = 0
for doc in cleanings:
    batch.delete(doc.reference)
    count += 1
    if count % 500 == 0:
        batch.commit()
        batch = db.batch()
batch.commit()
print(f'✅ Deleted {count} cleanings')

print('🔄 Database reset complete!')
