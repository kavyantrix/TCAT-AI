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
        
        # Fetch fresh data from AWS
        cost_data = aws_service.get_cost_and_usage(start_date, end_date)
        
        return {
            "status": "success",
            "data": cost_data,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_cost_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))