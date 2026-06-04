# app/routes/compliance.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, Optional, List
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select
from app.dependencies.database import AsyncSessionLocal, get_db
from app.models.iso_controls import ISOCControl

from sqlalchemy.ext.asyncio import AsyncSession  # <--- Agrega esta línea

from app.services.iso_compliance_analyzer import ISOComplianceAnalyzer
from app.dependencies.auth import get_current_user

# Definimos el prefijo limpio alineado con api.js de React
router = APIRouter(prefix="/api/compliance", tags=["ISO 27001 Compliance"])
analyzer = ISOComplianceAnalyzer()

# ===================================================================
# 🛠️ ESQUEMA FLEXIBLE: Soporta tanto 'applicable' como 'applies'
# ===================================================================
class SingleControlSchema(BaseModel):
    id: str
    applicable: Optional[bool] = True  # Soporte para el mock de React
    status: str
    justification: Optional[str] = None

class FullAssessmentRequest(BaseModel):
    controls: List[SingleControlSchema]

@router.get("/controls")
async def get_all_controls(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)  # ✅ esta es la sesión
):
    """Retorna los controles."""
    if category:
        controls = analyzer.get_controls_by_category(category)
        return {"category": category, "total": len(controls), "controls": controls}
    
    # ✅ Usar la sesión inyectada, no crear una nueva
    stmt = select(ISOCControl)
    result = await db.execute(stmt)
    db_controls = result.scalars().all()
    
    if db_controls:
        return {
            "controls": [
                {
                    "id": c.control_id,
                    "name": c.title,
                    "description": c.description,
                    "category": c.category,
                    "applicable": c.applies,
                    "status": c.status.lower() if c.status else "notimplemented",
                    "justification": c.justification
                } for c in db_controls
            ]
        }
    
    return analyzer.get_all_controls()

@router.post("/controls/{control_id}/evaluate")
async def evaluate_control_with_ai(
    control_id: str,
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Evalúa un control usando IA y un documento de evidencia"""
    document_id = request.get("document_id")
    
    # Aquí va la lógica de IA para evaluar el control
    # Por ahora, retorna un mock
    return {
        "status": "implemented",  # o "planned", "notImplemented"
        "justification": f"Control {control_id} evaluado con documento {document_id} por IA"
    }

@router.get("/statistics")
async def get_statistics(current_user: dict = Depends(get_current_user)):
    data = analyzer.get_all_controls()
    return {
        "standard": data.get("standard"),
        "version": data.get("version"),
        "total_controls": data.get("total_controls", 0),
        "distribution": data.get("controls_by_category", {})
    }

@router.post("/full-assessment")
async def full_assessment(
    payload: FullAssessmentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Procesa y guarda de forma persistente la matriz en Neon.tech"""
    async with AsyncSessionLocal() as session:
        try:
            updated_count = 0
            for ctrl_data in payload.controls:
                # Buscamos por el código identificador (ej: "A.5.1")
                stmt = select(ISOCControl).where(ISOCControl.control_id == ctrl_data.id)
                result = await session.execute(stmt)
                db_control = result.scalar_one_or_none()
                
                if db_control:
                    db_control.applies = ctrl_data.applicable
                    
                    # Normalizamos los estados de la interfaz hacia el estándar de base de datos
                    status_clean = ctrl_data.status.lower()
                    if "implemented" in status_clean or "implementado" in status_clean:
                        db_control.status = "Implementado"
                    elif "planned" in status_clean or "planificado" in status_clean:
                        db_control.status = "Planificado"
                    else:
                        db_control.status = "No Implementado"
                        
                    if ctrl_data.justification:
                        db_control.justification = ctrl_data.justification
                    updated_count += 1
            
            await session.commit()
            return {
                "status": "success",
                "message": f"Se actualizaron exitosamente {updated_count} controles.",
                "assessment_date": datetime.utcnow().isoformat()
            }
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error transaccional: {str(e)}")

from pydantic import BaseModel
class EvaluateRequest(BaseModel):
    document_id: str

@router.post("/{control_id}/evaluate")
async def evaluate_control(
    control_id: str,
    payload: EvaluateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Evalúa un control contra un documento específico usando IA"""
    from app.models.document import Document
    
    async with AsyncSessionLocal() as session:
        # Obtener el control
        stmt = select(ISOCControl).where(ISOCControl.id == control_id)
        result = await session.execute(stmt)
        db_control = result.scalar_one_or_none()
        
        if not db_control:
            raise HTTPException(status_code=404, detail="Control no encontrado")
            
        # Obtener el documento (asumiremos document_id es chapter_id o uuid)
        doc_stmt = select(Document).where(Document.id == payload.document_id)
        doc_result = await session.execute(doc_stmt)
        db_document = doc_result.scalar_one_or_none()
        
        if not db_document:
            raise HTTPException(status_code=404, detail="Documento no encontrado")
            
        if not db_document.content:
            raise HTTPException(status_code=400, detail="El documento está vacío")
            
        # Llamar a la IA
        evaluation = await analyzer.ai_service.evaluate_compliance(
            document_text=db_document.content,
            control_title=db_control.title,
            control_desc=db_control.description
        )
        
        # Actualizar la base de datos con el veredicto
        db_control.score = evaluation.get("score", 0)
        db_control.document_id = payload.document_id
        db_control.justification = evaluation.get("justification", "")
        
        # Traducir status de la IA al formato de BD que definió Elías
        ai_status = evaluation.get("status", "notImplemented").lower()
        if "implemented" in ai_status:
            db_control.status = "Implementado"
        elif "planned" in ai_status:
            db_control.status = "Planificado"
        else:
            db_control.status = "No Implementado"
            
        await session.commit()
        await session.refresh(db_control)
        
        return {
            "message": "Evaluación IA completada",
            "score": db_control.score,
            "status": ai_status,
            "justification": db_control.justification
        }

@router.post("/bulk-audit")
async def bulk_audit(
    current_user: dict = Depends(get_current_user)
):
    """Audita todos los controles 'No Implementados' contra todo el repositorio documental mediante IA/RAG"""
    from app.models.evidence_chunk import EvidenceChunk
    from app.services.embedding_service import EmbeddingService
    
    embedder = EmbeddingService()
    updated_count = 0
    results = []

    async with AsyncSessionLocal() as session:
        # Traer controles aplicables
        stmt = select(ISOCControl).where(ISOCControl.applies == True)
        result = await session.execute(stmt)
        controls = result.scalars().all()
        
        for control in controls:
            # 1. Crear embedding para el control
            query_vector = embedder.generate_single_embedding(f"{control.title}. {control.description}")
            
            # 2. Buscar similitud de coseno en la documentación de la empresa
            chunk_stmt = (
                select(EvidenceChunk)
                .order_by(EvidenceChunk.embedding.cosine_distance(query_vector))
                .limit(4)
            )
            chunk_res = await session.execute(chunk_stmt)
            top_chunks = chunk_res.scalars().all()
            
            context = "\n\n".join([f"- {c.content}" for c in top_chunks]) if top_chunks else ""
            
            # 3. Mandar a evaluar
            evaluation = await analyzer.ai_service.mass_evaluate_control(
                control_title=control.title,
                control_desc=control.description,
                context_chunks=context
            )
            
            # 4. Actualizar BD
            control.score = evaluation.get("score", 0)
            control.justification = evaluation.get("justification", "")
            
            ai_status = evaluation.get("status", "notImplemented").lower()
            if "implemented" in ai_status:
                control.status = "Implementado"
            elif "planned" in ai_status:
                control.status = "Planificado"
            else:
                control.status = "No Implementado"
                
            updated_count += 1
            results.append({"id": control.control_id, "status": control.status, "score": control.score, "justification": control.justification})
            
        await session.commit()
        
    return {
        "message": f"Auditoría Masiva completada. {updated_count} controles evaluados.",
        "results": results
    }