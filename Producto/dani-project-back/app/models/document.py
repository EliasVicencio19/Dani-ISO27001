import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, Enum, Integer
from sqlalchemy.sql import func
from app.dependencies.database import Base

class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.DRAFT, nullable=False)
    version = Column(String(20), default="v1.0", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Optionally store the user ID who last modified or created it
    # created_by = Column(String(36), nullable=True)
