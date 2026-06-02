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