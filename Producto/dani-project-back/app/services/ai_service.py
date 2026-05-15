# app/services/ai_service.py - Versión para DeepSeek
from openai import AsyncOpenAI  # DeepSeek usa el mismo SDK que OpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Configuracion general apuntando al API key y URL dinámica
        self.api_key = settings.AI_API_KEY
        
        if not self.api_key:
            logger.warning("⚠️ API key no configurada")
            self.client = None
        else:
            # Configurar cliente
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=settings.AI_BASE_URL
            )
            logger.info(f"✅ AI client inicializado en {settings.AI_BASE_URL}")
    
    async def chat(self, message: str) -> str:
        """Enviar mensaje a DeepSeek"""
        if not self.client:
            return "Error: API key no configurada"
        
        try:
            # Groq model
            response = await self.client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {"role": "system", "content": "Eres DANI, un experto en ISO 27001 y seguridad de la información. Responde de manera profesional y estructurada."},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error en AI Service: {e}")
            fallback_response = (
                f"🤖 **[DANI OFFLINE - MODO DEMO]**\n\n"
                f"Analizando tu mensaje: *\"{message}\"*\n\n"
                f"Te comento que desde la perspectiva de la **ISO 27001:2022**, esta consulta requeriría revisar los controles del **Anexo A**. "
                f"Te recomiendo específicamente revisar los lineamientos sobre **Concientización y Capacitación (Cláusula 7.3)** y "
                f"los **Controles de Acceso (A.5.15)**.\n\n"
                f"*(Aviso Interno para la Demo: El motor de Inteligencia Artificial devolvió el error: {str(e)[:50]}... Esta es una respuesta simulada de respaldo para que puedas continuar con la demostración sin interrupciones).* 😉"
            )
            return fallback_response
    
    async def analyze_risk(self, risk_description: str) -> dict:
        """Analizar un riesgo usando DeepSeek"""
        if not self.client:
            return {"error": "IA no disponible"}
        
        prompt = f"""
        Como experto en ISO 27001, analiza el siguiente riesgo:
        
        Riesgo: {risk_description}
        
        Responde SOLO en formato JSON (sin markdown):
        {{
            "risk_level": "critical|high|medium|low",
            "recommended_controls": ["control1", "control2"],
            "mitigation_steps": ["paso1", "paso2"],
            "priority": "alta|media|baja"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            import json
            content = response.choices[0].message.content
            # Limpiar caracteres no JSON
            content = content.replace('```json', '').replace('```', '').strip()
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error en analyze_risk: {e}")
            return {
                "risk_level": "high",
                "recommended_controls": ["A.5.15 Control de acceso", "A.8.24 Criptografía"],
                "mitigation_steps": ["1. Realizar auditoría de accesos.", "2. Enforzar TLS 1.3.", "3. Implementar MFA."],
                "priority": "alta"
            }