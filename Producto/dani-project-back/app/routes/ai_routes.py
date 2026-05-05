# app/routes/ai_routes.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_service import AIService
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Chat con DeepSeek (experto ISO 27001)"""
    ai_service = AIService()
    response = await ai_service.chat(request.message)
    return {"response": response}