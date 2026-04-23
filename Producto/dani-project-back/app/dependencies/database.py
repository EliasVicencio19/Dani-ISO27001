from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, declared_attr
from sqlalchemy import Column, String, DateTime, JSON, Float, Integer, Boolean, Text, Enum
from datetime import datetime
from typing import Any
import uuid

from app.config import settings

# Crear engine asíncrono
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Solo en desarrollo
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Crear sesión asíncrona
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base para modelos
class Base:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)

Base = declarative_base(cls=Base)

# Dependencia para obtener sesión de BD
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()