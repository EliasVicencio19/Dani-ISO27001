from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.risk import Risk, RiskLevel, RiskStatus

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Dashboard principal - KPIs y métricas en tiempo real.
    """
    
    # 1. Total de usuarios
    users_query = select(func.count()).select_from(User)
    users_result = await db.execute(users_query)
    total_users = users_result.scalar() or 0
    
    # 2. Usuarios activos
    active_users_query = select(func.count()).select_from(User).where(User.is_active == True)
    active_users_result = await db.execute(active_users_query)
    active_users = active_users_result.scalar() or 0
    
    # 3. Total de riesgos
    risks_query = select(func.count()).select_from(Risk)
    risks_result = await db.execute(risks_query)
    total_risks = risks_result.scalar() or 0
    
    # 4. Riesgos por nivel
    critical_query = select(func.count()).select_from(Risk).where(Risk.risk_level == RiskLevel.CRITICAL)
    critical_result = await db.execute(critical_query)
    critical_risks = critical_result.scalar() or 0
    
    high_query = select(func.count()).select_from(Risk).where(Risk.risk_level == RiskLevel.HIGH)
    high_result = await db.execute(high_query)
    high_risks = high_result.scalar() or 0
    
    medium_query = select(func.count()).select_from(Risk).where(Risk.risk_level == RiskLevel.MEDIUM)
    medium_result = await db.execute(medium_query)
    medium_risks = medium_result.scalar() or 0
    
    low_query = select(func.count()).select_from(Risk).where(Risk.risk_level == RiskLevel.LOW)
    low_result = await db.execute(low_query)
    low_risks = low_result.scalar() or 0
    
    # 5. Riesgos abiertos
    open_query = select(func.count()).select_from(Risk).where(Risk.status == RiskStatus.OPEN)
    open_result = await db.execute(open_query)
    open_risks = open_result.scalar() or 0
    
    # 6. Riesgos resueltos (mitigados + cerrados)
    resolved_query = select(func.count()).select_from(Risk).where(
        Risk.status.in_([RiskStatus.MITIGATED, RiskStatus.CLOSED])
    )
    resolved_result = await db.execute(resolved_query)
    resolved_risks = resolved_result.scalar() or 0
    
    # 7. Calcular Health Score (ejemplo: % de riesgos resueltos)
    health_score = round((resolved_risks / total_risks * 100)) if total_risks > 0 else 0
    
    # 8. Próxima auditoría (días restantes - valor ficticio por ahora)
    days_to_audit = 47  # Esto podría venir de una configuración
    
    # 9. Controles implementados (valor ficticio - se actualizará cuando tengamos la tabla de controles)
    controls_implemented = 92
    controls_total = 114
    
    return {
        "health_score": health_score,
        "total_users": total_users,
        "active_users": active_users,
        "total_risks": total_risks,
        "risks_by_level": {
            "critical": critical_risks,
            "high": high_risks,
            "medium": medium_risks,
            "low": low_risks
        },
        "open_risks": open_risks,
        "resolved_risks": resolved_risks,
        "controls": {
            "implemented": controls_implemented,
            "total": controls_total
        },
        "days_to_audit": days_to_audit,
        "pending_actions": open_risks  # Por ahora, acciones pendientes = riesgos abiertos
    }


@router.get("/recent-activity")
async def get_recent_activity(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
):
    """Últimas actividades recientes"""
    
    # Últimos riesgos creados
    recent_risks_query = select(Risk).order_by(Risk.created_at.desc()).limit(limit)
    recent_risks_result = await db.execute(recent_risks_query)
    recent_risks = recent_risks_result.scalars().all()
    
    activities = []
    for risk in recent_risks:
        activities.append({
            "type": "risk",
            "action": "created",
            "title": risk.title,
            "level": risk.risk_level.value if risk.risk_level else "unknown",
            "date": risk.created_at.isoformat() if risk.created_at else None
        })
    
    return {
        "activities": activities,
        "total": len(activities)
    }