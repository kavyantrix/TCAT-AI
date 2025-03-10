from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import os
from openai import OpenAI
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ErrorItem(BaseModel):
    checkName: str
    category: str
    resources: Dict[str, Any]
    details: List[Any]
    timestamp: str

class ErrorAnalysisRequest(BaseModel):
    errors: List[ErrorItem]

@router.post("/analyze-with-chatgpt")
async def analyze_with_chatgpt(request: ErrorAnalysisRequest):
    try:
        error_data = request.errors
        
        if not error_data:
            raise HTTPException(status_code=400, detail="No error data provided")
        
        logger.info("Received error data for analysis")
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Create prompt from error data
        prompt = "Analyze these AWS Trusted Advisor check errors and provide recommendations:\n\n"
        for item in error_data:
            prompt += f"Check: {item.checkName}\n"
            prompt += f"Category: {item.category}\n"
            prompt += f"Resources: {item.resources}\n"
            prompt += "---\n"
        prompt += "\nPlease provide:\n1. Summary of issues\n2. Priority recommendations\n3. Best practices to prevent these issues"

        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an AWS infrastructure expert analyzing Trusted Advisor check results."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        analysis_result = {
            'timestamp': datetime.now().isoformat(),
            'analysis': response.choices[0].message.content,
            'error_count': len(error_data)
        }
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error in ChatGPT analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))