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
# 📌 TIMESTAMP MIXIN (agregar esto)
# ============================================
class TimestampMixin:
    """Mixin para agregar timestamps a los modelos"""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ Leer URL del .env sin valor por defecto hardcodeado
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Si no hay DATABASE_URL, error claro
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL no está configurada en el archivo .env")

# Solo mostrar de qué tipo es
if "sqlite" in DATABASE_URL:
    print("🗄️ Conectando a SQLite local")
elif "render.com" in DATABASE_URL:
    print("☁️ Conectando a PostgreSQL en Render")
else:
    print("💻 Conectando a PostgreSQL local")

print(f"🔗 URL: {DATABASE_URL[:60]}...")

# Crear engine (sin forzar SSL si no está en la URL)
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
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