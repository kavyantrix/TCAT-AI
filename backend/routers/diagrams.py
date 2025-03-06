from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db, ArchitectureDiagram, AWSResource
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from agno import agent  # Import the agent for diagram generation
from collections import Counter
from agno.agent import Agent
from agno.models.openai import OpenAIChat
import os
import json
from dotenv import load_dotenv
from agno.tools.python import PythonTools

router = APIRouter()

class DiagramRequest(BaseModel):
    name: str
    diagram_data: Dict[str, Any]
    user_id: Optional[str] = "anonymous"  # Default to anonymous until auth is implemented

class DiagramResponse(BaseModel):
    id: int
    name: str
    user_id: str
    diagram_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@router.post("/save", response_model=DiagramResponse)
async def save_diagram(diagram: DiagramRequest, db: Session = Depends(get_db)):
    try:
        # Check if a diagram with this name already exists for this user
        existing_diagram = db.query(ArchitectureDiagram).filter(
            ArchitectureDiagram.name == diagram.name,
            ArchitectureDiagram.user_id == diagram.user_id
        ).first()
        
        if existing_diagram:
            # Update existing diagram
            existing_diagram.diagram_data = diagram.diagram_data
            existing_diagram.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_diagram)
            return existing_diagram
        else:
            # Create new diagram
            new_diagram = ArchitectureDiagram(
                name=diagram.name,
                user_id=diagram.user_id,
                diagram_data=diagram.diagram_data
            )
            db.add(new_diagram)
            db.commit()
            db.refresh(new_diagram)
            return new_diagram
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving diagram: {str(e)}")

@router.get("/list/{user_id}", response_model=List[DiagramResponse])
async def list_diagrams(user_id: str, db: Session = Depends(get_db)):
    try:
        diagrams = db.query(ArchitectureDiagram).filter(
            ArchitectureDiagram.user_id == user_id
        ).all()
        return diagrams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing diagrams: {str(e)}")

@router.get("/{diagram_id}", response_model=DiagramResponse)
async def get_diagram(diagram_id: int, db: Session = Depends(get_db)):
    try:
        diagram = db.query(ArchitectureDiagram).filter(
            ArchitectureDiagram.id == diagram_id
        ).first()
        
        if not diagram:
            raise HTTPException(status_code=404, detail="Diagram not found")
            
        return diagram
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving diagram: {str(e)}")

@router.delete("/{diagram_id}")
async def delete_diagram(diagram_id: int, db: Session = Depends(get_db)):
    try:
        diagram = db.query(ArchitectureDiagram).filter(
            ArchitectureDiagram.id == diagram_id
        ).first()
        
        if not diagram:
            raise HTTPException(status_code=404, detail="Diagram not found")
            
        db.delete(diagram)
        db.commit()
        return {"status": "success", "message": "Diagram deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting diagram: {str(e)}")

class GenerateDiagramRequest(BaseModel):
    user_id: Optional[str] = "anonymous"

@router.post("/generate", response_model=DiagramResponse)
async def generate_diagram(request: GenerateDiagramRequest, db: Session = Depends(get_db)):
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
        
        # Use the agent to generate a diagram based on the prompt
        
        agent = Agent(
            model=OpenAIChat(id="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"),),
            description="You are an AI software architect responsible for generating AWS architecture diagrams based on a provided list of resources. Your task is to analyze the given AWS resources, infer logical connections between them, and output the architecture in the exact JSON format provided below.Rules: Always use the provided resources to generate the architecture.Infer reasonable connections where applicable, but do not introduce services that are not in the input. Ensure the output strictly follows this JSON structure: {'nodes':[{'id':'EC2-1741291043012','type':'awsService','position':{'x':-82.49434798358902,'y':252.43995631315244},'data':{'label':'EC2','serviceType':'EC2'},'zIndex':999,'width':150,'height':92,'selected':false,'dragging':false,'positionAbsolute':{'x':-82.49434798358902,'y':252.43995631315244}},{'id':'RDS-1741291608483','type':'awsService','position':{'x':-278.95708108032454,'y':126.47258935332718},'data':{'label':'RDS','serviceType':'RDS'},'zIndex':999,'width':150,'height':92,'selected':false,'dragging':false,'positionAbsolute':{'x':-278.95708108032454,'y':126.47258935332718}}],'edges':[{'type':'straight','markerEnd':{'type':'arrowclosed'},'style':{'stroke':'#555'},'source':'RDS-1741291608483','sourceHandle':'bottom-source','target':'RDS-1741291608483','targetHandle':'bottom-target','animated':false,'id':'reactflow__edge-RDS-1741291608483bottom-source-RDS-1741291608483bottom-target'},{'type':'straight','markerEnd':{'type':'arrowclosed'},'style':{'stroke':'#555'},'source':'EC2-1741291043012','sourceHandle':'left-source','target':'RDS-1741291608483','targetHandle':'bottom-target','animated':false,'id':'reactflow__edge-EC2-1741291043012left-source-RDS-1741291608483bottom-target'}]}. Do not provide explanations, additional text, or formatting outside the JSON response. The response must be a valid JSON object with correct syntax, no markdown, and no extra text. Use service type from these types EC2, Lambda, ECS, EKS, Fargate, S3, EBS, EFS, RDS, DynamoDB, ElastiCache, Aurora, VPC, LoadBalancer, CloudFront, APIGateway, Route53, IAM, Cognito, WAF, SNS, SQS, EventBridge do not make anything lower case or upper case use as it is", 
            markdown=True,
            tools=[PythonTools()], 
            show_tool_calls=False
        )
        
        # Provide context and user query to the agent
        full_prompt = f"Context about the user's AWS resources and costs:\n{context}\n\nUser question: Generate a json data for me based on the resources given"
        response = agent.run(full_prompt)
        # Save the generated diagram
        new_diagram = ArchitectureDiagram(
            name="Generated Diagram"+ datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            user_id=request.user_id,
            diagram_data=json.loads(response.content)
        )
        db.add(new_diagram)
        db.commit()
        db.refresh(new_diagram)
        
        return new_diagram
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating diagram: {str(e)}")