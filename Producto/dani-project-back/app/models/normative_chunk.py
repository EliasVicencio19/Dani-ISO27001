# app/models/normative_chunk.py
from sqlalchemy import Column, String, Text, Integer, DateTime, func
from app.dependencies.database import Base
from app.models.evidence_chunk import SafeVector
import uuid

class NormativeChunk(Base):
    __tablename__ = "normative_chunks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, index=True)
    document_name = Column(String(100), nullable=False)  # ej: "ISO 27001-2022 Español"
    clause = Column(String(50), nullable=False)         # ej: "A.8.24"
    page_number = Column(Integer, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)              # Texto enriquecido con contexto
    raw_text = Column(Text, nullable=False)             # Texto original limpio
    embedding = Column(SafeVector(384), nullable=True)   # Vector de 384 dimensiones
    created_at = Column(DateTime, server_default=func.now())
