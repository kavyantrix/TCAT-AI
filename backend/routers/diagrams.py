from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db, ArchitectureDiagram  # Updated import
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

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