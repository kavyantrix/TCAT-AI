from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base

class CostEntry(Base):
    __tablename__ = "cost_entries"

    id = Column(Integer, primary_key=True, index=True)
    service = Column(String)
    cost = Column(Float)
    date = Column(DateTime)
    region = Column(String)