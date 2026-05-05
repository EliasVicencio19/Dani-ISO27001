# app/services/ai_service.py - Versión para DeepSeek
from openai import AsyncOpenAI  # DeepSeek usa el mismo SDK que OpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # DeepSeek usa la misma biblioteca pero con base_url diferente
        self.api_key = settings.DEEPSEEK_API_KEY or settings.OPENAI_API_KEY
        
        if not self.api_key:
            logger.warning("⚠️ API key no configurada")
            self.client = None
        else:
            # Configurar cliente para DeepSeek
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://api.deepseek.com"  # Endpoint de DeepSeek
            )
            logger.info("✅ DeepSeek client inicializado")
    
    async def chat(self, message: str) -> str:
        """Enviar mensaje a DeepSeek"""
        if not self.client:
            return "Error: API key no configurada"
        
        try:
            # DeepSeek usa los mismos modelos
            response = await self.client.chat.completions.create(
                model="deepseek-chat",  # Modelo de DeepSeek
                messages=[
                    {"role": "system", "content": "Eres un experto en ISO 27001 y seguridad de la información."},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error en DeepSeek: {e}")
            return f"Lo siento, tuve un error: {str(e)}"
    
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
                model="deepseek-chat",
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
            return {"error": str(e), "risk_description": risk_description}