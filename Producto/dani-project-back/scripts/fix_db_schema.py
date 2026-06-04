import asyncio
import logging
from sqlalchemy import text
from app.dependencies.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_schema():
    logger.info("🛠️  Agregando columnas faltantes a la tabla 'iso_controls'...")
    async with engine.begin() as conn:
        try:
            # Agregamos las columnas que faltan
            await conn.execute(text("ALTER TABLE iso_controls ADD COLUMN applies BOOLEAN DEFAULT TRUE NOT NULL;"))
            logger.info("✅ Columna 'applies' agregada.")
        except Exception as e:
            logger.info(f"⚠️ La columna 'applies' ya existía o hubo un error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE iso_controls ADD COLUMN status VARCHAR(50) DEFAULT 'No Implementado' NOT NULL;"))
            logger.info("✅ Columna 'status' agregada.")
        except Exception as e:
            logger.info(f"⚠️ La columna 'status' ya existía o hubo un error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE iso_controls ADD COLUMN justification TEXT;"))
            logger.info("✅ Columna 'justification' agregada.")
        except Exception as e:
            logger.info(f"⚠️ La columna 'justification' ya existía o hubo un error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE iso_controls ADD COLUMN score INTEGER DEFAULT 0 NOT NULL;"))
            logger.info("✅ Columna 'score' agregada.")
        except Exception as e:
            logger.info(f"⚠️ La columna 'score' ya existía o hubo un error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE iso_controls ADD COLUMN document_id VARCHAR(36);"))
            logger.info("✅ Columna 'document_id' agregada.")
        except Exception as e:
            logger.info(f"⚠️ La columna 'document_id' ya existía o hubo un error: {e}")
            
    logger.info("🎉 ¡Esquema de base de datos actualizado correctamente!")

if __name__ == "__main__":
    asyncio.run(fix_schema())
