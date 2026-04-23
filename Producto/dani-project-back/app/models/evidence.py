from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class EvidenceType(str, enum.Enum):
    DOCUMENT = "document"
    SCREENSHOT = "screenshot"
    LOG = "log"
    AUDIT_REPORT = "audit_report"
    POLICY = "policy"
    PROCEDURE = "procedure"

class Evidence(Base):
    __tablename__ = "evidences"
    
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    evidence_type = Column(Enum(EvidenceType), default=EvidenceType.DOCUMENT)
    file_url = Column(String(1000), nullable=False)  # URL en Cloud Storage
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # en bytes
    mime_type = Column(String(100), nullable=False)
    metadata = Column(JSON, default={})  # Metadatos adicionales
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Relaciones
    risk_id = Column(String(36), ForeignKey("risks.id"))
    risk = relationship("Risk", back_populates="evidences")
    uploaded_by = Column(String(36), ForeignKey("users.id"))
    uploader = relationship("User", foreign_keys=[uploaded_by])