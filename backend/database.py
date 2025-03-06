from sqlalchemy import create_engine, Column, String, JSON, DateTime
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

# Add AWS Cost model
class AWSCost(Base):
    __tablename__ = "aws_costs"
    
    id = Column(String, primary_key=True)
    start_date = Column(String, index=True)
    end_date = Column(String, index=True)
    data = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow)

# Add AWS Advisor model
class AWSAdvisor(Base):
    __tablename__ = "aws_advisor"
    
    id = Column(String, primary_key=True)
    check_type = Column(String, index=True)
    data = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)