from fastapi import APIRouter
from pydantic import BaseModel
from app.services.deepseek_service import DeepSeekService

# Creamos el router para esta sección
router = APIRouter(prefix="/api/chat", tags=["Chat IA"])
deepseek_service = DeepSeekService()

# Definimos qué formato debe tener el mensaje que llega de React
class ChatRequest(BaseModel):
    text: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """Recibe un mensaje del frontend y devuelve la respuesta de DANI"""
    response = await deepseek_service.chat_with_dani(request.text)
    return response