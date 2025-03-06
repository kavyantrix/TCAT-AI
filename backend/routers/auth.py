from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import logging
from sqlalchemy.orm import Session



logger = logging.getLogger(__name__)
router = APIRouter()

class AWSCredentials(BaseModel):
    accessKeyId: str
    secretAccessKey: str

@router.post("/validate")
async def validate_credentials(credentials: AWSCredentials):
    try:
        logger.info("Attempting to validate AWS credentials")
        client = boto3.client(
            'sts',
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name='us-east-1'  # Default region
        )
        
        response = client.get_caller_identity()
        
        return {
            "status": "success",
            "message": "AWS credentials are valid",
            "user": response['Arn']
        }
    except ClientError as e:
        logger.error(f"AWS credential validation failed: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"AWS credential validation failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during validation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )