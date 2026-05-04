# app/repositories/risk_repository.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any, List, Optional
import uuid

from app.models.risk import Risk, RiskLevel, RiskStatus

class RiskRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_risk(self, risk_data: Dict[str, Any]) -> Risk:
        """Crea un nuevo riesgo en la base de datos."""
        # Aseguramos que tenga un ID
        if "id" not in risk_data:
            risk_data["id"] = str(uuid.uuid4())
            
        new_risk = Risk(**risk_data)
        self.db.add(new_risk)
        await self.db.commit()
        await self.db.refresh(new_risk)
        return new_risk

    async def get_by_id(self, risk_id: str) -> Optional[Risk]:
        """Obtiene un riesgo específico por su ID."""
        query = select(Risk).where(Risk.id == risk_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100, **filters) -> List[Risk]:
        """Obtiene todos los riesgos, aplicando filtros si existen."""
        query = select(Risk)
        
        for key, value in filters.items():
            if value is not None and hasattr(Risk, key):
                query = query.where(getattr(Risk, key) == value)
                
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_risk_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas generales de los riesgos (para el dashboard)."""
        # Total de riesgos
        total_query = select(func.count()).select_from(Risk)
        total_result = await self.db.execute(total_query)
        total = total_result.scalar() or 0

        # Riesgos abiertos
        open_query = select(func.count()).select_from(Risk).where(Risk.status == RiskStatus.OPEN)
        open_result = await self.db.execute(open_query)
        open_risks = open_result.scalar() or 0

        # Distribución por nivel
        levels_stats = {}
        for level in RiskLevel:
            level_query = select(func.count()).select_from(Risk).where(Risk.risk_level == level)
            level_result = await self.db.execute(level_query)
            levels_stats[level.value] = level_result.scalar() or 0

        return {
            "total_risks": total,
            "open_risks": open_risks,
            "resolved_risks": total - open_risks,
            "by_level": levels_stats
        }

    async def get_high_priority_risks(self) -> List[Risk]:
        """Obtiene los riesgos críticos y altos que aún están abiertos."""
        query = select(Risk).where(
            Risk.risk_level.in_([RiskLevel.CRITICAL, RiskLevel.HIGH]),
            Risk.status == RiskStatus.OPEN
        ).order_by(Risk.created_at.desc() if hasattr(Risk, 'created_at') else None)
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_risk_status(self, risk_id: str, new_status: RiskStatus, updated_by: str) -> Optional[Risk]:
        """Actualiza el estado de un riesgo."""
        risk = await self.get_by_id(risk_id)
        if not risk:
            return None
            
        risk.status = new_status
        await self.db.commit()
        await self.db.refresh(risk)
        return risk