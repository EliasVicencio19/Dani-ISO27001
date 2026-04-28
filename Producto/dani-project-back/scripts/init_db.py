# scripts/init_db.py
import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path (un nivel arriba de scripts)
sys.path.insert(0, str(Path(__file__).parent.parent))

# Ahora importar
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.dependencies.database import Base
from app.models.user import User
from app.models.risk import Risk
from dotenv import load_dotenv

# Cargar .env desde la raíz
load_dotenv(Path(__file__).parent.parent / ".env")

async def init_database():
    DATABASE_URL = os.getenv("DATABASE_URL")
    print(f"Conectando a: {DATABASE_URL}")
    
    if not DATABASE_URL:
        print("❌ ERROR: DATABASE_URL no está configurada en .env")
        return
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Todas las tablas fueron creadas exitosamente")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())