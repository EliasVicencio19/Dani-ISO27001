from sqlalchemy import Column, String, Text, JSON
import uuid
from app.dependencies.database import Base

class ISOCControl(Base):
    __tablename__ = "iso_controls"
    
    # ID interno único
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Campos requeridos por el script de Elías
    control_id = Column(String(50), unique=True, index=True, nullable=False) # Ej: "5.1"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Ej: "Organizacional"
    clause_reference = Column(String(100), nullable=True)
    implementation_guide = Column(Text, nullable=True)
    related_controls = Column(JSON, default=[])
    attributes = Column(JSON, default={})