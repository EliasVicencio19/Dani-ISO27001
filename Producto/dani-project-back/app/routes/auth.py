from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    # Validate user from database
    # user = await get_user_by_email(login_data.email)
    # if not user or not AuthService.verify_password(login_data.password, user.password_hash):
    #     raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # For demo purposes
    access_token = AuthService.create_access_token(
        data={"sub": login_data.email, "role": "admin"}
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    return {"valid": True, "user": payload.get("sub")}