# scripts/setup_supabase.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
import uuid
from sqlalchemy import text, select
from app.dependencies.database import engine, Base, AsyncSessionLocal
from app.models.iso_controls import ISOCControl
from app.models.capa import CAPA
# CAMBIO: faltaba este import. SQLAlchemy solo crea las tablas de modelos que
# ya fueron importados antes de llamar a Base.metadata.create_all(). Como
# GapAnalysis, RemediationAction, ControlImplementation y KPI nunca se
# importaban aquí, sus tablas (incluyendo "kpi") nunca se crearon en Supabase,
# aunque el resto del setup corriera sin errores.
from app.models.gap_analysis import GapAnalysis, RemediationAction, ControlImplementation, KPI
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