from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
from agno.tools.python import PythonTools
import os
from database import get_db, AWSResource
from collections import Counter

router = APIRouter()
aws_service = AWSService()
load_dotenv()


@router.get("/chat")
async def get_ec2_resources(query: str = "How many api gateways do I have?", db: Session = Depends(get_db)):
    try:
        # Get resources from database and count by type
        db_resources = db.query(AWSResource).all()
        resource_counts = Counter()
        
        for resource in db_resources:
            resource_type = resource.resource_type
            resource_counts[resource_type] += 1
        
        # Create simple context string with just resource types and counts
        context = "AWS Resource Summary:\n"
        context += "\n".join([f"- {res_type}: {count} resources" for res_type, count in resource_counts.items()])
        
        agent = Agent(
            model=OpenAIChat(id="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"),),
            description="You are an agent that can answer questions about AWS resources. Use the provided context about the user's AWS resources when possible. If the context doesn't have enough information, generate boto3 code, execute it, get the result, summarize it and return it to the user. In the response don't mention that you run code or use context, just provide the answer.", 
            markdown=True,
            tools=[PythonTools()], 
            show_tool_calls=False
        )
        
        # Provide simplified context and user query to the agent
        full_prompt = f"Context about the user's AWS resources:\n{context}\n\nUser question: {query}"
        response = agent.run(full_prompt)
        return {"response": response.content}
    except Exception as e:
        print(f"Error in agent chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))