from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.auth_service import AuthService
from app.dependencies.database import get_db
from app.models.user import User
from app.models.evidence import Evidence
from app.models.risk import Risk
from app.models.assessment import RiskAssessment

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Buscar al usuario en la base de datos de Neon.tech
    query = select(User).where(User.email == login_data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    # 2. Validar que el usuario exista y que el hash de la contraseña coincida
    if not user or not AuthService.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # 3. Generar el token con los datos reales del usuario
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    return {"valid": True, "user": payload.get("sub")}