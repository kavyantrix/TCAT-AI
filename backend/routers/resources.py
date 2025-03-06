from fastapi import APIRouter, HTTPException
from services.aws_service import AWSService

router = APIRouter()
aws_service = AWSService()

@router.get("/ec2")
async def get_ec2_resources():
    try:
        instances = aws_service.get_ec2_instances()
        return {
            "status": "success",
            "data": instances
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))