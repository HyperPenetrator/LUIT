from fastapi import APIRouter, HTTPException
from services.firebase_service import get_firestore_client
from google.cloud.firestore import FieldFilter

router = APIRouter(prefix="/labs", tags=["labs"])

@router.get("/")
async def get_labs():
    """Get all testing labs"""
    try:
        db = get_firestore_client()
        docs = db.collection("testingLabs").stream()
        labs = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            # Flatten GeoPoint for JSON response
            if 'location' in data:
                data['latitude'] = data['location'].latitude
                data['longitude'] = data['location'].longitude
                del data['location']
            labs.append(data)
        return {"success": True, "labs": labs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
