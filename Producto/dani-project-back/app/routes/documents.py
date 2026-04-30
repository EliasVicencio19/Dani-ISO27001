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

@router.post("/generate/{doc_type}")
async def generate_document(
    doc_type: str,
    current_user: dict = Depends(get_current_user)
):
    """Generar un documento"""
    return {
        "message": f"Documento {doc_type} generado",
        "document_url": f"/documents/{doc_type}_sample.pdf"
    }