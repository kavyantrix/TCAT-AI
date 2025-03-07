from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime
import os
import uuid
from typing import Optional
from pydantic import BaseModel
import base64
from dotenv import load_dotenv
import PIL.Image
from google import genai
from google.genai import types

load_dotenv()
router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Update the request model to include the prompt
class ImageAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    user_id: Optional[str] = "anonymous"
    prompt: Optional[str] = "Analyze this AWS architecture diagram. Identify the services shown, explain the architecture flow, and suggest improvements or potential issues."

#System prompt: Defines expected behavior
SYSTEM_PROMPT = (
    "You are an AI software architect analyzing an AWS architecture diagram. "
    "Your task is to review the provided diagram, identify possible issues, "
    "suggest improvements, and ensure best practices. "
    "Provide clear and actionable recommendations based on the diagram."
)
# Then update the analyze_image function to use the provided prompt
@router.post("/analyze")
async def analyze_image(request: ImageAnalysisRequest, db: Session = Depends(get_db)):
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_data.split(",")[1] if "," in request.image_data else request.image_data)
        
        # Save image to file
        filename = f"{uuid.uuid4()}.png"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        image = PIL.Image.open(file_path)
        print()
        # Initialize Gemini Flash agent



        final_prompt = f"{SYSTEM_PROMPT} User Request: {request.prompt}"
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[types.Content(role="user", parts=[types.Part(text=final_prompt)]), image])
                
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")