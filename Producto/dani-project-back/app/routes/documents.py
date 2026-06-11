# app/routes/documents.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.document import Document, DocumentStatus
from pydantic import BaseModel

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/")
async def get_all_documents(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener todos los documentos"""
    result = await db.execute(select(Document).offset(skip).limit(limit))
    docs = result.scalars().all()
    
    documents = []
    for d in docs:
        documents.append({
            "id": d.id,
            "chapter_id": d.chapter_id,
            "name": d.title,
            "status": d.status.value if hasattr(d.status, 'value') else d.status,
            "version": d.version.replace('v', '') if d.version else '1.0',
            "updated": d.updated_at.strftime('%b %d') if d.updated_at else 'N/A',
            "signatures": "0/0"
        })
        
    return {
        "message": "Endpoint de documentos",
        "documents": documents,
        "total": len(documents)
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
    
    prompt = f"""Actúa como un Consultor Lead Implementer y Auditor Líder de ISO 27001 con 20 años de experiencia.
Se te ha asignado redactar un borrador extenso, exhaustivo y listo para producción del 'Capítulo {chapter_number}: {title}' para el Manual del Sistema de Gestión de Seguridad de la Información (SGSI).

Tu objetivo es generar un documento que sea TAN COMPLETO que el cliente solo tenga que rellenar los datos de su empresa. No hagas un resumen corto; redacta políticas, directrices, flujos y responsabilidades reales. Usa marcadores como [NOMBRE_EMPRESA] para los datos personalizables.

Estructura obligatoria (en Markdown):
# {chapter_number}. {title}

## Propósito y Objetivos
(Redacta de manera profesional y extensa el por qué este capítulo es crítico para el SGSI y qué se busca proteger o gestionar).

## Alcance y Aplicabilidad
(Detalla exhaustivamente a quiénes aplica esta política, en qué sistemas, y qué excepciones existen. Sé realista).

## Directrices y Políticas Normativas
(Desarrolla en profundidad los requisitos de la norma ISO 27001 para este capítulo. Inventa sub-cláusulas realistas, ejemplos de métricas, reglas de negocio y controles técnicos/administrativos que un auditor esperaría ver).

## Roles y Responsabilidades
(Crea una matriz o listado detallado de qué hace la Alta Dirección, el CISO, RRHH, TI y los empleados generales en el contexto de este capítulo).

## Registros y Evidencias
(Lista exacta de qué artefactos documentales se deben generar para demostrar cumplimiento).

IMPORTANTE: Escribe al menos 800 palabras. El tono debe ser altamente corporativo, directivo y riguroso."""
    
    try:
        content = await ai_service.generate_document(prompt)
    except Exception as e:
        content = f"Error conectando con la IA: {str(e)}"
        
    return {
        "message": f"Documento {doc_type} generado",
        "content": content
    }

class DocumentCreate(BaseModel):
    chapter_id: str
    title: str
    content: str

class DocumentStatusUpdate(BaseModel):
    status: str

@router.get("/{chapter_id}")
async def get_document(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Document).filter(Document.chapter_id == chapter_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": document.id,
        "chapter_id": document.chapter_id,
        "title": document.title,
        "content": document.content,
        "status": document.status.value,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at
    }

@router.post("/")
async def save_document(
    data: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Document).filter(Document.chapter_id == data.chapter_id))
    document = result.scalar_one_or_none()
    
    if document:
        document.content = data.content
        document.title = data.title
    else:
        document = Document(
            chapter_id=data.chapter_id,
            title=data.title,
            content=data.content,
            status=DocumentStatus.DRAFT,
            version="v1.0"
        )
        db.add(document)
        
    await db.commit()
    await db.refresh(document)
    
    return {"message": "Document saved successfully", "id": document.id, "status": document.status.value}

@router.put("/{chapter_id}/status")
async def update_document_status(
    chapter_id: str,
    data: DocumentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Document).filter(Document.chapter_id == chapter_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        new_status = DocumentStatus(data.status.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    # RBAC: Solo admin, auditor o manager pueden aprobar o publicar
    if new_status in [DocumentStatus.APPROVED, DocumentStatus.PUBLISHED]:
        user_role = current_user.get("role", "")
        if user_role not in ["admin", "auditor", "manager"]:
            raise HTTPException(
                status_code=403, 
                detail="Solo administradores, auditores o gerentes pueden aprobar o publicar documentos"
            )
            
    document.status = new_status
    
    # Bump version automatically when published
    if new_status == DocumentStatus.PUBLISHED:
        parts = document.version.strip("v").split(".")
        if len(parts) == 2:
            document.version = f"v{int(parts[0])+1}.0"
            
    await db.commit()
    await db.refresh(document)
    
    return {"message": f"Status updated to {document.status.value}", "version": document.version}

@router.get("/published/policies")
async def get_published_policies(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.models.document import DocumentAcknowledgement
    
    # Obtenemos todos los documentos publicados
    result = await db.execute(select(Document).filter(Document.status == DocumentStatus.PUBLISHED))
    documents = result.scalars().all()
    
    # Obtenemos los acuses de recibo del usuario actual
    user_id = current_user.get("id") or current_user.get("sub")
    ack_result = await db.execute(select(DocumentAcknowledgement).filter(DocumentAcknowledgement.user_id == user_id))
    acks = ack_result.scalars().all()
    ack_doc_ids = {ack.document_id for ack in acks}
    
    policies = []
    for doc in documents:
        policies.append({
            "id": doc.id,
            "chapter_id": doc.chapter_id,
            "title": doc.title,
            "version": doc.version,
            "content": doc.content,
            "is_acknowledged": doc.id in ack_doc_ids
        })
        
    return {"policies": policies}

@router.post("/{document_id}/acknowledge")
async def acknowledge_policy(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.models.document import DocumentAcknowledgement
    from app.models.user import User
    
    user_id = current_user.get("user_id")
    
    # Fallback para tokens antiguos que no traían el user_id
    if not user_id:
        email = current_user.get("email")
        if email:
            user_query = await db.execute(select(User).where(User.email == email))
            db_user = user_query.scalar_one_or_none()
            if db_user:
                user_id = str(db_user.id)
                
    if not user_id:
        raise HTTPException(status_code=401, detail="No se pudo identificar al usuario.")
    
    # Verificamos que el documento exista
    doc_result = await db.execute(select(Document).filter(Document.id == document_id))
    if not doc_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Verificamos si ya firmó el acuse
    result = await db.execute(
        select(DocumentAcknowledgement)
        .filter(DocumentAcknowledgement.user_id == user_id)
        .filter(DocumentAcknowledgement.document_id == document_id)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        return {"message": "Already acknowledged"}
        
    ack = DocumentAcknowledgement(
        user_id=user_id,
        document_id=document_id
    )
    db.add(ack)
    await db.commit()
    
    return {"message": "Acknowledged successfully"}