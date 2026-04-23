from sqlalchemy import Column, String, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    AUDITOR = "auditor"
    EMPLOYEE = "employee"
    MANAGER = "manager"

class User(Base):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    preferences = Column(JSON, default={})
    
    # Relaciones
    risks_created = relationship("Risk", foreign_keys="Risk.created_by", back_populates="creator")
    evidences_uploaded = relationship("Evidence", foreign_keys="Evidence.uploaded_by", back_populates="uploader")