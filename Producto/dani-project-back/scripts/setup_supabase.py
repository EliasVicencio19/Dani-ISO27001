# scripts/setup_supabase.py
# CAMBIO: faltaban estas líneas. Python no encuentra el paquete "app" porque
# al ejecutar `python scripts/setup_supabase.py`, el directorio que queda en
# sys.path es "scripts/", no la raíz del proyecto (dani-project-back/), que
# es donde vive la carpeta "app/". Insertamos la raíz manualmente, igual que
# ya hacen tus otros scripts (create_tables.py, init_db.py).
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
import uuid
from sqlalchemy import text, select
from app.dependencies.database import engine, Base, AsyncSessionLocal
from app.models.iso_controls import ISOCControl
from app.models.capa import CAPA
from app.services.auth_service import AuthService
from app.models.user import User, UserRole


async def main():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tablas creadas/verificadas en Supabase")

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "admin@dani27001.com"))
        admin = result.scalar_one_or_none()

        if not admin:
            admin_user = User(
                id=str(uuid.uuid4()),
                full_name="Admin User",
                email="admin@dani27001.com",
                hashed_password=AuthService.get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            print("✅ Usuario admin creado: admin@dani27001.com / admin123")
        else:
            print("ℹ️ Usuario admin ya existe, no se crea de nuevo")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())