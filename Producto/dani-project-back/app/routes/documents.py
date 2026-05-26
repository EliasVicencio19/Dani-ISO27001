# app/routes/documents.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/")
async def get_all_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Obtener todos los documentos"""
    return {
        "message": "Endpoint de documentos",
        "documents": [],
        "total": 0
    }

from app.services.ai_service import AIService
from fastapi import Body

ai_service = AIService()

@router.post("/generate/{doc_type}")
async def generate_document(
    doc_type: str,
    prompt_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Generar un documento usando IA"""
    title = prompt_data.get("title", "")
    chapter_number = prompt_data.get("chapter_number", "")
    
    prompt = f"Actúa como un auditor ISO 27001 experto. Escribe un borrador profesional en formato Markdown para el 'Capítulo {chapter_number}: {title}' de un Manual de Sistema de Gestión de Seguridad de la Información (SGSI). Debe tener una estructura formal con: Título principal (#), Propósito (##), Alcance (##) y Requisitos Normativos (##) o secciones relevantes según la ISO 27001:2022. Usa un tono corporativo."
    
    try:
        content = await ai_service.chat(prompt)
    except Exception as e:
        content = f"Error conectando con la IA: {str(e)}"
        
    return {
        "message": f"Documento {doc_type} generado",
        "content": content
    }