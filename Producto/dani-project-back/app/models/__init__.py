# app/models/__init__.py

# Importar en orden para evitar dependencias circulares SQLAlchemy
from app.models.user import User, UserRole
from app.models.risk import Risk, RiskLevel, RiskStatus, RiskCategory
from app.models.evidence import Evidence, EvidenceType
from app.models.evidence_chunk import EvidenceChunk
from app.models.assessment import RiskAssessment
from app.models.prompt import AIPrompt

__all__ = [
    "User", "UserRole",
    "Risk", "RiskLevel", "RiskStatus", "RiskCategory", 
    "Evidence", "EvidenceType",
    "EvidenceChunk",
    "RiskAssessment"
]