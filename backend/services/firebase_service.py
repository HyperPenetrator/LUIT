import firebase_admin
from firebase_admin import credentials, firestore
from config import get_settings
import json
import os

# Initialize Firebase
def init_firebase():
    if not firebase_admin._apps:
        try:
            settings = get_settings()
            
            # Log what we received
            print(f"📋 Firebase Project ID: {settings.firebase_project_id}")
            print(f"📋 Firebase Client Email: {settings.firebase_client_email}")
            
            # Check if project_id is set
            if not settings.firebase_project_id:
                print("❌ ERROR: FIREBASE_PROJECT_ID is not set!")
                raise ValueError("FIREBASE_PROJECT_ID environment variable not found")
                
            if not settings.firebase_private_key:
                print("❌ ERROR: FIREBASE_PRIVATE_KEY is not set!")
                raise ValueError("FIREBASE_PRIVATE_KEY environment variable not found")
                
            cred_dict = {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key_id": settings.firebase_private_key_id,
                "private_key": settings.firebase_private_key.replace('\\n', '\n'),
                "client_email": settings.firebase_client_email,
                "client_id": settings.firebase_client_id,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
            }
            cred = credentials.Certificate(cred_dict)
            # Explicitly set project_id when initializing
            firebase_admin.initialize_app(cred, {
                'projectId': settings.firebase_project_id
            })
            print(f"✅ Firebase initialized with project: {settings.firebase_project_id}")
            return True
        except Exception as e:
            print(f"❌ Firebase initialization failed: {str(e)}")
            raise
    else:
        print(f"ℹ️  Firebase already initialized")
        return True

try:
    init_firebase()
except Exception as e:
    print(f"⚠️  Firebase initialization error at startup: {str(e)}")
    print("Firebase operations will fail until credentials are properly configured")

def get_firestore_client():
    """Get Firestore client for database operations"""
    return firestore.client()

def add_document(collection: str, data: dict) -> str:
    """Add document to Firestore, returns document ID"""
    db = get_firestore_client()
    doc_ref = db.collection(collection).add(data)
    return doc_ref[1].id if doc_ref else None

def get_document(collection: str, doc_id: str) -> dict:
    """Get document from Firestore"""
    db = get_firestore_client()
    doc = db.collection(collection).document(doc_id).get()
    return doc.to_dict() if doc.exists else None

def update_document(collection: str, doc_id: str, data: dict):
    """Update document in Firestore"""
    db = get_firestore_client()
    db.collection(collection).document(doc_id).update(data)

def delete_document(collection: str, doc_id: str):
    """Delete document from Firestore"""
    db = get_firestore_client()
    db.collection(collection).document(doc_id).delete()

def query_documents(collection: str, field: str, operator: str, value: any) -> list:
    """Query documents from Firestore"""
    db = get_firestore_client()
    query = db.collection(collection)
    
    if operator == "==":
        query = query.where(field, "==", value)
    elif operator == "<":
        query = query.where(field, "<", value)
    elif operator == ">":
        query = query.where(field, ">", value)
    elif operator == "<=":
        query = query.where(field, "<=", value)
    elif operator == ">=":
        query = query.where(field, ">=", value)
    
    docs = query.stream()
    return [doc.to_dict() for doc in docs]

