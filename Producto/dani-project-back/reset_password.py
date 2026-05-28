import asyncio
from app.dependencies.database import AsyncSessionLocal
from app.services.auth_service import AuthService
from app.models.user import User
from sqlalchemy import select

async def reset_password():
    async with AsyncSessionLocal() as session:
        # Buscar usuario por email
        result = await session.execute(select(User).where(User.email == "admin@dani27001.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("Usuario no encontrado. Creando uno nuevo...")
            import uuid
            new_user = User(
                id=str(uuid.uuid4()),
                email="admin@dani27001.com",
                full_name="Admin",
                hashed_password=AuthService.get_password_hash("admin123"),
                is_active=True
            )
            session.add(new_user)
            await session.commit()
            print("✅ Usuario admin creado")
        else:
            user.hashed_password = AuthService.get_password_hash("admin123")
            await session.commit()
            print("✅ Contraseña actualizada a 'admin123'")

asyncio.run(reset_password())