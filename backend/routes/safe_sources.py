from fastapi import APIRouter, HTTPException
from services.firebase_service import get_firestore_client

router = APIRouter(prefix="/safe-sources", tags=["safe-sources"])

@router.get("/")
async def get_safe_sources():
    """Get all verified safe water sources"""
    try:
        db = get_firestore_client()
        docs = db.collection("safeSources").stream()
        sources = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            if 'location' in data:
                data['latitude'] = data['location'].latitude
                data['longitude'] = data['location'].longitude
                del data['location']
            sources.append(data)
        return {"success": True, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
