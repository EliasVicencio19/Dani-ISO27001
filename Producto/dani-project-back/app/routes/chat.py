from fastapi import APIRouter
from pydantic import BaseModel
# Usamos el servicio oficial del backend que ya tiene configurado DeepSeek
from app.services.ai_service import AIService

# Declaramos el router apuntando exactamente a lo que espera React
router = APIRouter(prefix="/api/chat", tags=["Chat IA"])
ai_service = AIService()

# Definimos el esquema exacto que envía tu archivo api.js de React
class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """Recibe el mensaje de React y devuelve la respuesta de DANI usando AIService"""
    # Llamamos a la función chat() de Elías que ya valida las llaves de DeepSeek
    reply = await ai_service.chat(request.message)
    
    # Devolvemos la propiedad 'reply' que React mapea en tu ChatDANI.jsx
    return {"reply": reply}