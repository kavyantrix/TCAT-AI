from fastapi import APIRouter, HTTPException
import boto3
from datetime import datetime
from typing import List, Dict, Any

router = APIRouter()

@router.get("/")
async def get_checks():
    try:
        # Initialize AWS Support client
        support_client = boto3.client('support')
        
        # Get all available checks
        checks_response = support_client.describe_trusted_advisor_checks(
            language='en'
        )
        
        # Get check results for each check
        results = []
        for check in checks_response['checks']:
            try:
                check_result = support_client.describe_trusted_advisor_check_result(
                    checkId=check['id'],
                    language='en'
                )
                
                results.append({
                    'id': check['id'],
                    'name': check['name'],
                    'category': check['category'],
                    'result': check_result['result'],
                    'timestamp': datetime.utcnow().isoformat()
                })
            except Exception as check_error:
                print(f"Error fetching check {check['id']}: {str(check_error)}")
                continue
                
        return results
    except Exception as e:
        print(f"Error fetching Trusted Advisor checks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))