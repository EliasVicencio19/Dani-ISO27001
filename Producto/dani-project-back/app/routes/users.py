from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from app.dependencies.database import get_db
from app.models.user import User, UserRole
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("")
@router.get("/")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    query = select(User)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "is_active": user.is_active,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "department": "General" # Mapeo por defecto ya que no existe en BD
        }
        for user in users
    ]

class CreateUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "employee"
    department: str = "General"

@router.post("")
@router.post("/")
async def create_user(user_data: CreateUserRequest, db: AsyncSession = Depends(get_db)):
    # Check if exists
    query = select(User).where(User.email == user_data.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    # Hash password
    hashed_pwd = AuthService.get_password_hash(user_data.password)
    
    # Map string role to Enum
    try:
        role_enum = UserRole(user_data.role)
    except ValueError:
        role_enum = UserRole.EMPLOYEE

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=role_enum,
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "Usuario creado exitosamente", "id": new_user.id}

@router.get("/{user_id}")
async def get_user_by_id(user_id: str, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "is_active": user.is_active,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "department": "General"
    }


