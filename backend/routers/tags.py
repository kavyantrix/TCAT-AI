from fastapi import APIRouter, HTTPException
from services.aws_service import AWSService

router = APIRouter()
aws_service = AWSService()

@router.get("/resources")
async def get_tagged_resources():
    try:
        resources = aws_service.get_resources_by_tag()
        return {
            "status": "success",
            "data": resources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))