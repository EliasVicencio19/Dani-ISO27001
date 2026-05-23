# app/dependencies/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# Usa PostgreSQL en lugar de SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dani27001_user:HE6m4xe6cQyT02n3WsBXQEttHcaU5vGE@dpg-d81o031j2pic738ogi4g-a.frankfurt-postgres.render.com/dani27001")

# Si no hay DATABASE_URL, error claro
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL no está configurada en el archivo .env")

# Solo mostrar de qué tipo es
if "sqlite" in DATABASE_URL:
    print("🗄️ Conectando a SQLite local")
elif "render.com" in DATABASE_URL:
    print("☁️ Conectando a PostgreSQL en Render")
else:
    # Asegurar que usa asyncpg
    if "postgresql://" in DATABASE_URL and "+asyncpg" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    # Agregar SSL requirement si no está
    if "?" not in DATABASE_URL:
        DATABASE_URL += "?ssl=require"
    elif "ssl=require" not in DATABASE_URL:
        DATABASE_URL += "&ssl=require"
    
    print(f"✅ Conectando a PostgreSQL en Render")

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