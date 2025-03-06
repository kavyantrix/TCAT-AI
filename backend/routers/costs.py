from fastapi import APIRouter, HTTPException
from services.aws_service import AWSService
from datetime import datetime, timedelta

router = APIRouter()
aws_service = AWSService()

@router.get("/summary")
async def get_cost_summary():
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        cost_data = aws_service.get_cost_and_usage(start_date, end_date)
        return {
            "status": "success",
            "data": cost_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))