# app/routes/evidence.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from datetime import datetime
import uuid

from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

@router.get("/")
async def get_all_evidence(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Obtener todas las evidencias"""
    return {
        "message": "Endpoint de evidencias",
        "evidence": [],
        "total": 0
    }

@router.get("/{evidence_id}")
async def get_evidence(
    evidence_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener una evidencia específica"""
    return {
        "id": evidence_id,
        "title": "Ejemplo de evidencia",
        "description": "Descripción de la evidencia"
    }

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Subir evidencia"""
    return {
        "message": "Evidencia subida",
        "filename": file.filename,
        "status": "success"
    }