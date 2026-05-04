# app/models/prompt.py
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
import uuid

# Importamos el Base de donde lo tengan configurado (asumiendo database.py)
from app.dependencies.database import Base

class AIPrompt(Base):
    __tablename__ = "ai_prompts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False) # Ej: "analisis_riesgo_v1"
    category = Column(String, index=True, nullable=False) # Ej: "risks", "controls"
    description = Column(String, nullable=True)
    system_prompt = Column(Text, nullable=False) # La "personalidad"
    user_prompt_template = Column(Text, nullable=False) # El molde con variables
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())