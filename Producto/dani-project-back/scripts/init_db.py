import asyncio
import sys
from pathlib import Path

# Agregar backend al path
sys.path.append(str(Path(__file__).parent.parent))

from app.dependencies.database import engine, Base
from app.models.user import User
from app.models.risk import Risk
from app.models.evidence import Evidence
from app.models.assessment import RiskAssessment

async def init_database():
    """Crear todas las tablas"""
    print("📊 Inicializando base de datos...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tablas creadas exitosamente")

async def create_test_user():
    """Crear usuario de prueba"""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.services.auth_service import AuthService
    from app.models.user import User, UserRole
    
    async with AsyncSession(engine) as session:
        # Verificar si ya existe
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "admin@dani27001.com")
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            test_user = User(
                email="admin@dani27001.com",
                full_name="Admin User",
                hashed_password=AuthService.get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(test_user)
            await session.commit()
            print("✅ Usuario de prueba creado: admin@dani27001.com / admin123")
        else:
            print("ℹ Usuario de prueba ya existe")

async def main():
    print("Saltando la creación de tablas (ya existen)...")
    print("Creando usuario administrador...")
    await create_test_user()

if __name__ == "__main__":
    asyncio.run(main())
