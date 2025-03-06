from fastapi import APIRouter, HTTPException
from services.aws_service import AWSService

router = APIRouter()
aws_service = AWSService()

@router.get("/recommendations")
async def get_recommendations():
    try:
        recommendations = aws_service.get_trusted_advisor_recommendations()
        return {
            "status": "success",
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))