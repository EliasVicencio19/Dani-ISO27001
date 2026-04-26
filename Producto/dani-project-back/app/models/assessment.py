from sqlalchemy import Column, String, Text, Float, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.dependencies.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    risk_id = Column(String(36), ForeignKey("risks.id"))
    ai_analysis = Column(Text, nullable=False)
    recommendations = Column(JSON, default=[])
    confidence_score = Column(Float, default=0.0)
    controls_mapped = Column(JSON, default=[])
    version = Column(Integer, default=1)
    
    # Relaciones
    risk = relationship("Risk", back_populates="assessments")