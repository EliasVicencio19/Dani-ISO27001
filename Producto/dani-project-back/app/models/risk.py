from sqlalchemy import Column, String, Text, Integer, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class RiskLevel(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class RiskStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    MITIGATED = "mitigated"
    ACCEPTED = "accepted"
    CLOSED = "closed"

class RiskCategory(str, enum.Enum):
    SECURITY = "security"
    PRIVACY = "privacy"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"
    THIRD_PARTY = "third_party"

class Risk(Base):
    __tablename__ = "risks"
    
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(RiskCategory), default=RiskCategory.SECURITY)
    likelihood = Column(Integer, nullable=False)  # 1-5
    impact = Column(Integer, nullable=False)  # 1-5
    risk_level = Column(Enum(RiskLevel), nullable=False)
    status = Column(Enum(RiskStatus), default=RiskStatus.OPEN)
    controls = Column(JSON, default=[])  # Lista de controles ISO 27001
    mitigation_plan = Column(Text, nullable=True)
    owner = Column(String(100), nullable=False)  # Email del responsable
    due_date = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Relaciones
    created_by = Column(String(36), ForeignKey("users.id"))
    creator = relationship("User", foreign_keys=[created_by])
    evidences = relationship("Evidence", back_populates="risk", cascade="all, delete-orphan")
    assessments = relationship("RiskAssessment", back_populates="risk", cascade="all, delete-orphan")