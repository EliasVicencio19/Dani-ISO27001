from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import Optional, List, Dict, Any, TypeVar, Generic
from datetime import datetime

T = TypeVar('T')

class DatabaseService(Generic[T]):
    """Servicio genérico para operaciones CRUD"""
    
    def __init__(self, model: T, session: AsyncSession):
        self.model = model
        self.session = session
    
    async def create(self, **kwargs) -> T:
        """Crear un nuevo registro"""
        obj = self.model(**kwargs)
        self.session.add(obj)
        await self.session.flush()
        return obj
    
    async def get(self, id: str) -> Optional[T]:
        """Obtener por ID"""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100, **filters) -> List[T]:
        """Obtener todos con filtros"""
        query = select(self.model)
        
        # Aplicar filtros
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update(self, id: str, **kwargs) -> Optional[T]:
        """Actualizar un registro"""
        kwargs['updated_at'] = datetime.utcnow()
        await self.session.execute(
            update(self.model)
            .where(self.model.id == id)
            .values(**kwargs)
        )
        await self.session.flush()
        return await self.get(id)
    
    async def delete(self, id: str) -> bool:
        """Eliminar un registro"""
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.session.flush()
        return result.rowcount > 0
    
    async def count(self, **filters) -> int:
        """Contar registros con filtros"""
        query = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)
        result = await self.session.execute(query)
        return result.scalar()