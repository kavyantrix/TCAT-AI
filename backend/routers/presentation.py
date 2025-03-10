from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
from openai import OpenAI
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class AnalysisData(BaseModel):
    analysis: str
    errorCount: int
    timestamp: str

@router.post("/structure-ppt")
async def structure_ppt(analysis_data: AnalysisData):
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        logger.info("Structuring PPT from analysis data")

        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": """You are an expert presentation consultant specializing in creating executive-level business presentations. 
                Your task is to transform technical analysis into clear, actionable business presentations."""},
                {"role": "user", "content": f"""
                    Convert the following analysis results into a structured PowerPoint presentation format...

                    1. A professional title slide that captures the essence of the analysis
                    2. A clear and logical agenda outlining the presentation flow
                    3. Key findings section with detailed explanations and impact assessment
                    4. Priority recommendations ranked by importance and implementation timeline
                    5. Best practices for prevention and risk mitigation
                    6. A strong conclusion summarizing the main points and next steps
                    7. Thought-provoking Q&A discussion points

                    Analysis to convert:
                    {analysis_data.analysis}
                    
                    Return a JSON object with exactly these keys:
                    {{
                        "title": "string - create a professional and impactful title",
                        "agenda": "string - list the main sections in a clear structure",
                        "key_findings": ["array of strings - each finding with its business impact"],
                        "recommendations": ["array of strings - prioritized actionable items"],
                        "conclusion": "string - summarize key points and call to action",
                        "qa_points": ["array of strings - strategic discussion points"]
                    }}

                    Ensure the content is:
                    - Concise and impactful
                    - Business-focused rather than technical
                    - Action-oriented
                    - Suitable for executive presentation
                """}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={ "type": "json_object" }
        )
        
        ppt_content = json.loads(response.choices[0].message.content)
        
        # Validate required keys
        required_keys = ['title', 'agenda', 'key_findings', 'recommendations', 'conclusion', 'qa_points']
        for key in required_keys:
            if key not in ppt_content:
                raise ValueError(f"Missing required key: {key}")

        return ppt_content

    except json.JSONDecodeError as e:
        logger.error(f"JSON Parsing Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Invalid JSON format from ChatGPT")
    except Exception as e:
        logger.error(f"PPT Structure Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))