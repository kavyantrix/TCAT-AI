from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from database import get_db, AWSAdvisor
from datetime import datetime, timedelta

router = APIRouter()
aws_service = AWSService()

# Define cache expiration time (e.g., 1 day)
CACHE_EXPIRATION = timedelta(days=1)

@router.get("/details")
async def get_advisor_details(db: Session = Depends(get_db)):
    try:
        # Check if we have recent data in the database
        db_advisor = db.query(AWSAdvisor).filter(
            AWSAdvisor.check_type == "details"
        ).first()
        
        # If we have recent data (less than CACHE_EXPIRATION old), return it
        if db_advisor and (datetime.utcnow() - db_advisor.last_updated) < CACHE_EXPIRATION:
            return {
                "status": "success",
                "data": db_advisor.data,
                "source": "database"
            }
        
        # Otherwise, fetch fresh data from AWS
        advisor_data = aws_service.get_trusted_advisor_details()
        
        # Store the data in the database
        if db_advisor:
            # Update existing record
            db_advisor.data = advisor_data
            db_advisor.last_updated = datetime.utcnow()
        else:
            # Create new record
            db_advisor = AWSAdvisor(
                id="advisor_details",
                check_type="details",
                data=advisor_data,
                last_updated=datetime.utcnow()
            )
            db.add(db_advisor)
        
        db.commit()
        
        return {
            "status": "success",
            "data": advisor_data,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_advisor_details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
async def get_recommendations(db: Session = Depends(get_db)):
    try:
        # Check if we have recent data in the database
        db_advisor = db.query(AWSAdvisor).filter(
            AWSAdvisor.check_type == "recommendations"
        ).first()
        
        # If we have recent data (less than CACHE_EXPIRATION old), return it
        if db_advisor and (datetime.utcnow() - db_advisor.last_updated) < CACHE_EXPIRATION:
            return {
                "status": "success",
                "data": db_advisor.data,
                "source": "database"
            }
        
        # Otherwise, fetch fresh data from AWS
        recommendations = aws_service.get_trusted_advisor_details()
        
        # Store the data in the database
        if db_advisor:
            # Update existing record
            db_advisor.data = recommendations
            db_advisor.last_updated = datetime.utcnow()
        else:
            # Create new record
            db_advisor = AWSAdvisor(
                id="advisor_recommendations",
                check_type="recommendations",
                data=recommendations,
                last_updated=datetime.utcnow()
            )
            db.add(db_advisor)
        
        db.commit()
        
        return {
            "status": "success",
            "data": recommendations,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))