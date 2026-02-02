from fastapi import APIRouter, HTTPException
from services.firebase_service import query_documents

router = APIRouter(prefix="/guidance", tags=["guidance"])

@router.get("/")
async def get_guidance(contaminationType: str = None, language: str = "en"):
    """Get treatment guidance based on contamination type"""
    try:
        from services.firebase_service import get_firestore_client
        db = get_firestore_client()
        query = db.collection("treatmentGuidance").where("language", "==", language)
        
        if contaminationType:
            query = query.where("contaminationType", "==", contaminationType)
            
        docs = query.stream()
        guidance = [doc.to_dict() for doc in docs]
        return {"success": True, "guidance": guidance}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
