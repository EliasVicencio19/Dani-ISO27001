from sqlalchemy import Column, String, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    risk_id = Column(String(36), ForeignKey("risks.id"))
    ai_analysis = Column(Text, nullable=False)  # Análisis completo de IA
    recommendations = Column(JSON, default=[])  # Lista de recomendaciones
    confidence_score = Column(Float, default=0.0)  # Score de confianza 0-1
    controls_mapped = Column(JSON, default=[])  # Controles ISO 27001 mapeados
    version = Column(Integer, default=1)
    
    # Relaciones
    risk = relationship("Risk", back_populates="assessments")