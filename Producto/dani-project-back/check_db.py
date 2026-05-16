# check_db.py
import asyncio
import os

async def test_connection():
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
        
        DATABASE_URL = os.getenv("DATABASE_URL", "")
        if not DATABASE_URL:
            print("❌ DATABASE_URL no está configurada")
            return
        
        print(f"✅ DATABASE_URL encontrada: {DATABASE_URL[:50]}...")
        
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Conexión exitosa a PostgreSQL!")
            print(f"   Resultado: {result.scalar()}")
        
        await engine.dispose()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())