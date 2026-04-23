from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.models.risk import Risk, RiskLevel, RiskStatus, RiskCategory
from app.services.db_service import DatabaseService

class RiskRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.db_service = DatabaseService(Risk, session)
    
    async def create_risk(self, risk_data: Dict[str, Any]) -> Risk:
        """Crear un nuevo riesgo"""
        return await self.db_service.create(**risk_data)
    
    async def get_risk_by_id(self, risk_id: str) -> Optional[Risk]:
        """Obtener riesgo por ID"""
        return await self.db_service.get(risk_id)
    
    async def get_risks_by_status(self, status: RiskStatus) -> List[Risk]:
        """Obtener riesgos por estado"""
        return await self.db_service.get_all(status=status)
    
    async def get_risks_by_owner(self, owner_email: str) -> List[Risk]:
        """Obtener riesgos por responsable"""
        return await self.db_service.get_all(owner=owner_email)
    
    async def get_high_priority_risks(self) -> List[Risk]:
        """Obtener riesgos de alta prioridad"""
        query = select(Risk).where(
            or_(
                Risk.risk_level == RiskLevel.CRITICAL,
                Risk.risk_level == RiskLevel.HIGH
            )
        ).where(Risk.status != RiskStatus.CLOSED)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update_risk_status(self, risk_id: str, status: RiskStatus, user_email: str) -> Optional[Risk]:
        """Actualizar estado de riesgo"""
        return await self.db_service.update(
            risk_id, 
            status=status, 
            updated_by=user_email,
            closed_at=datetime.utcnow() if status == RiskStatus.CLOSED else None
        )
    
    async def get_risk_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de riesgos"""
        total = await self.db_service.count()
        
        # Riesgos por nivel
        critical = await self.db_service.count(risk_level=RiskLevel.CRITICAL)
        high = await self.db_service.count(risk_level=RiskLevel.HIGH)
        medium = await self.db_service.count(risk_level=RiskLevel.MEDIUM)
        low = await self.db_service.count(risk_level=RiskLevel.LOW)
        
        # Riesgos por estado
        open_risks = await self.db_service.count(status=RiskStatus.OPEN)
        in_review = await self.db_service.count(status=RiskStatus.IN_REVIEW)
        mitigated = await self.db_service.count(status=RiskStatus.MITIGATED)
        closed = await self.db_service.count(status=RiskStatus.CLOSED)
        
        return {
            "total": total,
            "by_level": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low
            },
            "by_status": {
                "open": open_risks,
                "in_review": in_review,
                "mitigated": mitigated,
                "closed": closed
            }
        }
    
    async def search_risks(self, query: str, filters: Dict[str, Any] = None) -> List[Risk]:
        """Búsqueda avanzada de riesgos"""
        search_conditions = [
            Risk.title.ilike(f"%{query}%"),
            Risk.description.ilike(f"%{query}%")
        ]
        
        base_query = select(Risk).where(or_(*search_conditions))
        
        if filters:
            if filters.get("status"):
                base_query = base_query.where(Risk.status == filters["status"])
            if filters.get("risk_level"):
                base_query = base_query.where(Risk.risk_level == filters["risk_level"])
            if filters.get("category"):
                base_query = base_query.where(Risk.category == filters["category"])
            if filters.get("owner"):
                base_query = base_query.where(Risk.owner == filters["owner"])
        
        result = await self.session.execute(base_query)
        return result.scalars().all()