from sqlalchemy import create_engine, Column, String, JSON, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Add AWS Resource model
class AWSResource(Base):
    __tablename__ = "aws_resources"
    
    id = Column(String, primary_key=True)
    resource_type = Column(String, index=True)
    tags = Column(JSON)
    data = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow)

# Add AWS Advisor model
class AWSAdvisor(Base):
    __tablename__ = "aws_advisor"
    
    id = Column(String, primary_key=True)
    check_type = Column(String, index=True)
    data = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow)

# Add Architecture Diagram model (moved from diagram_model.py)
class ArchitectureDiagram(Base):
    __tablename__ = "architecture_diagrams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(String, index=True)  # For future user authentication
    diagram_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)