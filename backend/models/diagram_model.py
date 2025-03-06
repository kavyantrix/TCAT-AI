from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base
from datetime import datetime

class ArchitectureDiagram(Base):
    __tablename__ = "architecture_diagrams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(String, index=True)  # For future user authentication
    diagram_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)