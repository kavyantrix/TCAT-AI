from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from database import get_db, AWSCost
from datetime import datetime, timedelta

router = APIRouter()
aws_service = AWSService()

# Define cache expiration time (e.g., 1 day)
CACHE_EXPIRATION = timedelta(days=100)

@router.get("/summary")
async def get_cost_summary(db: Session = Depends(get_db)):
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Create a unique ID for this date range
        cost_id = f"cost_{start_date}_to_{end_date}"
        
        # Check if we have recent data in the database
        db_cost = db.query(AWSCost).filter(
            AWSCost.id == cost_id,
            AWSCost.start_date == start_date,
            AWSCost.end_date == end_date
        ).first()
        
        # If we have recent data (less than CACHE_EXPIRATION old), return it
        if db_cost and (datetime.utcnow() - db_cost.last_updated) < CACHE_EXPIRATION:
            return {
                "status": "success",
                "data": db_cost.data,
                "source": "database"
            }
        
        # Otherwise, fetch fresh data from AWS
        cost_data = aws_service.get_cost_and_usage(start_date, end_date)
        
        # Store the data in the database
        if db_cost:
            # Update existing record
            db_cost.data = cost_data
            db_cost.last_updated = datetime.utcnow()
        else:
            # Create new record
            db_cost = AWSCost(
                id=cost_id,
                start_date=start_date,
                end_date=end_date,
                data=cost_data,
                last_updated=datetime.utcnow()
            )
            db.add(db_cost)
        
        db.commit()
        
        return {
            "status": "success",
            "data": cost_data,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_cost_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))