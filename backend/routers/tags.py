from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from database import get_db, AWSResource
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json

router = APIRouter()
aws_service = AWSService()

# Define cache expiration time (e.g., 1 hour)
CACHE_EXPIRATION = timedelta(hours=100000)

@router.get("/resources")
async def get_tagged_resources(db: Session = Depends(get_db)):
    try:
        # Check if we have recent data in the database
        latest_resource = db.query(AWSResource).order_by(AWSResource.last_updated.desc()).first()
        
        # If we have recent data (less than CACHE_EXPIRATION old), return it
        if latest_resource and (datetime.utcnow() - latest_resource.last_updated) < CACHE_EXPIRATION:
            # Get all resources from the database
            db_resources = db.query(AWSResource).all()
            
            # Group resources by resource_type for frontend compatibility
            grouped_resources = {}
            for r in db_resources:
                if r.resource_type not in grouped_resources:
                    grouped_resources[r.resource_type] = []
                
                # Extract the data that matches frontend expectations
                resource_data = r.data
                grouped_resources[r.resource_type].append(resource_data)
            
            return {
                "status": "success",
                "data": grouped_resources,
                "source": "database"
            }
        
        # Otherwise, fetch fresh data from AWS
        aws_resources = aws_service.get_resources_by_tag()
        
        # Clear existing resources and store new ones
        db.query(AWSResource).delete()
        db.commit()
        
        # Process and store resources by type
        processed_resources = {}
        
        # Process the AWS response to match frontend expectations
        for resource_type, items in aws_resources.items():
            processed_resources[resource_type] = []
            
            for item in items:
                # Store each resource in the database
                resource_id = item.get('arn', f"unknown-{datetime.utcnow().timestamp()}")
                
                db_resource = AWSResource(
                    id=resource_id,
                    resource_type=resource_type,
                    tags=item.get('tags', []),
                    data=item,
                    last_updated=datetime.utcnow()
                )
                db.add(db_resource)
                processed_resources[resource_type].append(item)
        
        db.commit()
        
        return {
            "status": "success",
            "data": processed_resources,
            "source": "aws"
        }
    except Exception as e:
        print(f"Error in get_tagged_resources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))