# app/dependencies/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# 📌 VECTOR SUPPORT (pgvector)
# ============================================
# Detectar si pgvector está soportado
PGVECTOR_SUPPORTED = False  # Por defecto, deshabilitado para evitar errores

# Intentar importar pgvector si está disponible
try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_SUPPORTED = True
    print("✅ pgvector soportado")
except ImportError:
    print("⚠️ pgvector no disponible, usando fallback")
    
    
# ============================================
# 📌 TIMESTAMP MIXIN
# ============================================
class TimestampMixin:
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================
# 📌 CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL no está configurada en el archivo .env")

# Convertir URL a formato async si es PostgreSQL
if "postgresql://" in DATABASE_URL and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    print("✅ Convertida URL a formato asyncpg")

# Agregar SSL requirement si no está (para Render)
if "postgresql" in DATABASE_URL and "ssl" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&ssl=require"
    else:
        DATABASE_URL += "?ssl=require"

print(f"🔗 Conectando a BD: {DATABASE_URL[:60]}...")

# Crear engine asíncrono
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()