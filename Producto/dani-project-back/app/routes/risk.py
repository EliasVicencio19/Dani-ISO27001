from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.repositories.risk_repository import RiskRepository
from app.models.risk import RiskLevel, RiskStatus, RiskCategory
from app.dependencies.auth import get_current_user

router = APIRouter()

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
    risk_level: str
    status: str
    created_at: datetime

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