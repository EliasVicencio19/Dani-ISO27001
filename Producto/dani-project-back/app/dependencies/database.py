# app/dependencies/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Variable global para rastrear si pgvector está disponible en la base de datos
PGVECTOR_SUPPORTED = True

def set_pgvector_supported(val: bool):
    global PGVECTOR_SUPPORTED
    PGVECTOR_SUPPORTED = val

# Usa PostgreSQL en lugar de SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dani27001_user:HE6m4xe6cQyT02n3WsBXQEttHcaU5vGE@dpg-d81o031j2pic738ogi4g-a.frankfurt-postgres.render.com/dani27001")

# Si no hay DATABASE_URL, usar SQLite local (para desarrollo)
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./dani27001.db"
    print("⚠️ Usando SQLite local (modo desarrollo)")
else:
    # Asegurar que usa asyncpg
    if "postgresql://" in DATABASE_URL and "+asyncpg" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    # Agregar SSL requirement si no es localhost y no está en la URL
    is_local = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL
    if not is_local:
        if "?" not in DATABASE_URL:
            DATABASE_URL += "?ssl=require"
        elif "ssl=require" not in DATABASE_URL:
            DATABASE_URL += "&ssl=require"
        print(f"✅ Conectando a PostgreSQL en la Nube (con SSL)")
    else:
        print(f"💻 Conectando a PostgreSQL Local (sin SSL)")

print(f"🔗 URL: {DATABASE_URL[:50]}...")  # Debug (oculta la contraseña parcialmente)

# Crear engine para PostgreSQL
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Muestra SQL en consola (útil para debugging)
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

# Dependencia para obtener la sesión
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