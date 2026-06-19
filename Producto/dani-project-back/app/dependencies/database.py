# app/dependencies/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, DateTime
# CAMBIO: importamos NullPool. En serverless (Vercel) cada invocación puede ser
# una instancia nueva del proceso; mantener un pool propio de SQLAlchemy no
# tiene sentido y agota las conexiones de Postgres muy rápido. Dejamos que el
# Connection Pooler de Supabase (PgBouncer) sea quien poolee las conexiones.
from sqlalchemy.pool import NullPool
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# 📌 VECTOR SUPPORT (pgvector)
# ============================================
PGVECTOR_SUPPORTED = False

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

# CAMBIO: el bloque original agregaba "?ssl=require" en la URL, pensado para
# Render. Con asyncpg ese query param NO es válido (asyncpg no reconoce
# "ssl=require" como parámetro de URL) y puede romper la conexión a Supabase.
# El SSL hacia Supabase se exige vía el propio host del pooler, así que
# simplemente lo quitamos. Si en el futuro necesitas forzar SSL explícito,
# se hace por `connect_args={"ssl": "require"}` y no por la URL.
#
# ANTES:
# if "postgresql" in DATABASE_URL and "ssl" not in DATABASE_URL:
#     if "?" in DATABASE_URL:
#         DATABASE_URL += "&ssl=require"
#     else:
#         DATABASE_URL += "?ssl=require"

print(f"🔗 Conectando a BD: {DATABASE_URL[:60]}...")

# CAMBIO: si usas el Connection Pooler de Supabase (puerto 6543, modo
# "Transaction"), PgBouncer NO soporta prepared statements. asyncpg por
# defecto cachea/usa prepared statements, así que hay que desactivarlos.
# Detectamos automáticamente el puerto 6543 para aplicar esto solo cuando
# corresponde (si usas el puerto directo 5432 no hace falta, pero no hace daño).
USING_PGBOUNCER = ":6543" in DATABASE_URL

connect_args = {}
if USING_PGBOUNCER:
    connect_args = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    print("🔁 Detectado puerto 6543 (Supabase PgBouncer): prepared statements deshabilitados")

# Crear engine asíncrono
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    # CAMBIO: antes -> pool_size=5, max_overflow=10 (pool propio de SQLAlchemy).
    # Ahora usamos NullPool: cada conexión se abre y cierra por request, y es
    # PgBouncer/Supabase quien gestiona el pooling real entre todas las
    # invocaciones serverless.
    poolclass=NullPool,
    connect_args=connect_args,
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