from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.dependencies.database import get_db
from app.repositories.risk_repository import RiskRepository
from app.models.risk import RiskLevel, RiskStatus, RiskCategory
from app.dependencies.auth import get_current_user

# --- IMPORTAMOS NUESTRO NUEVO SERVICIO DE DEEPSEEK ---
from app.services.deepseek_service import DeepSeekService

router = APIRouter(prefix="/api/risks", tags=["Risks"])
ai_processor = DeepSeekService() # Instanciamos el servicio de IA de Max

class RiskCreate(BaseModel):
    title: str
    description: str
    category: RiskCategory = RiskCategory.SECURITY
    likelihood: int = 1
    impact: int = 1
    owner: str
    due_date: Optional[datetime] = None

class RiskResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    likelihood: int
    impact: int
    risk_level: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=RiskResponse)
async def create_risk(
    risk_data: RiskCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crear un nuevo riesgo"""
    risk_repo = RiskRepository(db)
    
    # Calcular nivel de riesgo
    risk_score = risk_data.likelihood * risk_data.impact
    if risk_score >= 15:
        risk_level = RiskLevel.CRITICAL
    elif risk_score >= 8:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 4:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW
    
    risk = await risk_repo.create_risk({
        **risk_data.dict(),
        "risk_level": risk_level,
        "created_by": current_user["user_id"],
        "status": RiskStatus.OPEN
    })
    
    return risk

@router.get("/", response_model=List[RiskResponse])
async def get_risks(
    status: Optional[RiskStatus] = None,
    risk_level: Optional[RiskLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de riesgos con filtros"""
    risk_repo = RiskRepository(db)
    
    filters = {}
    if status:
        filters["status"] = status
    if risk_level:
        filters["risk_level"] = risk_level
    
    risks = await risk_repo.get_all(skip=skip, limit=limit, **filters)
    return risks

@router.get("/statistics")
async def get_risk_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener estadísticas de riesgos para dashboard"""
    risk_repo = RiskRepository(db)
    stats = await risk_repo.get_risk_statistics()
    
    return stats

@router.get("/high-priority")
async def get_high_priority_risks(
    db: AsyncSession = Depends(get_db)
):
    """Obtener riesgos de alta prioridad"""
    risk_repo = RiskRepository(db)
    risks = await risk_repo.get_high_priority_risks()
    return risks

@router.put("/{risk_id}/status")
async def update_risk_status(
    risk_id: str,
    status: RiskStatus,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Actualizar estado de un riesgo"""
    risk_repo = RiskRepository(db)
    
    risk = await risk_repo.update_risk_status(
        risk_id, 
        status, 
        current_user["email"]
    )
    
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    return {"message": "Risk status updated successfully", "risk": risk}

# ==========================================
# 🤖 NUEVO ENDPOINT: ANÁLISIS DE IA (DEEPSEEK)
# ==========================================
@router.post("/{risk_id}/analyze")
async def analyze_risk_with_ai(
    risk_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analizar un riesgo existente usando DeepSeek V4 Flash"""
    risk_repo = RiskRepository(db)
    
    # 1. Buscamos el riesgo en la BD
    risk = await risk_repo.get_by_id(risk_id) 
    
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    # Convertimos el objeto SQLAlchemy a diccionario para enviarlo a la IA
    risk_data = {
        "title": risk.title,
        "description": risk.description,
        "category": str(risk.category)
    }
    
    # 2. Enviamos los datos al servicio de DeepSeek
    analysis_result = await ai_processor.analyze_risk(risk_data)
    
    return {"message": "Analysis complete", "data": analysis_result}

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[RiskCategory] = None
    likelihood: Optional[int] = None
    impact: Optional[int] = None
    owner: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[RiskStatus] = None

@router.put("/{risk_id}", response_model=RiskResponse)
async def update_risk(
    risk_id: str,
    risk_data: RiskUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Actualizar un riesgo completo"""
    risk_repo = RiskRepository(db)
    
    # Buscamos el riesgo primero
    risk = await risk_repo.get_by_id(risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
        
    updated_risk = await risk_repo.update_risk(risk_id, risk_data.dict(exclude_unset=True))
    return updated_risk

@router.delete("/{risk_id}")
async def delete_risk(
    risk_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Eliminar un riesgo"""
    risk_repo = RiskRepository(db)
    
    # Buscamos el riesgo primero
    risk = await risk_repo.get_by_id(risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
        
    success = await risk_repo.delete_risk(risk_id)
    if not success:
         raise HTTPException(status_code=500, detail="Error deleting risk")
         
    return {"message": "Risk deleted successfully"}