from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from database import get_db, AWSAdvisor
from datetime import datetime, timedelta
import json

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
        
        # Filter to keep only resources with warning or error status
        filtered_data = {}
        if isinstance(advisor_data, dict):
            for category, checks in advisor_data.items():
                if isinstance(checks, list):
                    filtered_checks = []
                    for check in checks:
                        # Ensure we're dealing with a dictionary
                        if not isinstance(check, dict):
                            continue
                            
                        # Debug the check status
                        print(f"Check status: {check.get('status')}")
                        
                        # Explicitly check for warning or error status
                        status = check.get('status')
                        if status and status.lower() in ['warning', 'error']:
                            filtered_checks.append(check)
                            print(f"Added check with status: {status}")
                    
                    # Only add the category if it has any filtered checks
                    if filtered_checks:
                        filtered_data[category] = filtered_checks
                        print(f"Added category {category} with {len(filtered_checks)} checks")
        
        # Debug the filtered data
        print(f"Total categories after filtering: {len(filtered_data)}")
        for category, checks in filtered_data.items():
            print(f"Category {category}: {len(checks)} checks")
        
        # Store the filtered data in the database
        if db_advisor:
            # Update existing record
            db_advisor.data = filtered_data
            db_advisor.last_updated = datetime.utcnow()
        else:
            # Create new record
            db_advisor = AWSAdvisor(
                id="advisor_details",
                check_type="details",
                data=filtered_data,
                last_updated=datetime.utcnow()
            )
            db.add(db_advisor)
        
        db.commit()
        
        return {
            "status": "success",
            "data": filtered_data,
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
        
        # Filter to keep only resources with warning or error status
        filtered_recommendations = {}
        if isinstance(recommendations, dict):
            for category, checks in recommendations.items():
                if isinstance(checks, list):
                    filtered_checks = []
                    for check in checks:
                        # Ensure we're dealing with a dictionary
                        if not isinstance(check, dict):
                            continue
                            
                        # Debug the check status
                        print(f"Check status: {check.get('status')}")
                        
                        # Explicitly check for warning or error status
                        status = check.get('status')
                        if status and status.lower() in ['warning', 'error']:
                            filtered_checks.append(check)
                            print(f"Added check with status: {status}")
                    
                    # Only add the category if it has any filtered checks
                    if filtered_checks:
                        filtered_recommendations[category] = filtered_checks
                        print(f"Added category {category} with {len(filtered_checks)} checks")
        
        # Debug the filtered data
        print(f"Total categories after filtering: {len(filtered_recommendations)}")
        for category, checks in filtered_recommendations.items():
            print(f"Category {category}: {len(checks)} checks")
        
        # Store the filtered data in the database
        if db_advisor:
            # Update existing record
            db_advisor.data = filtered_recommendations
            db_advisor.last_updated = datetime.utcnow()
        else:
            # Create new record
            db_advisor = AWSAdvisor(
                id="advisor_recommendations",
                check_type="recommendations",
                data=filtered_recommendations,
                last_updated=datetime.utcnow()
            )
            db.add(db_advisor)
        
        db.commit()
        
        return {
            "status": "success",
            "data": filtered_recommendations,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))