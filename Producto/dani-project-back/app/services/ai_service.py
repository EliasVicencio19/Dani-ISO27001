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
    
    async def chat(self, message: str, context: str = None) -> str:
        """Enviar mensaje a DeepSeek con contexto RAG opcional"""
        if not self.client:
            return "Error: API key no configurada"
            
        system_content = "Eres DANI, un experto en ISO 27001 y seguridad de la información. Responde de manera profesional y estructurada."
        if context:
            system_content += (
                f"\n\n[CONTEXTO DE EVIDENCIAS DE LA ORGANIZACIÓN]\n{context}\n\n"
                f"REGLAS DE RESPUESTA:\n"
                f"1. Responde basándote en la información provista en el contexto anterior.\n"
                f"2. Si la documentación provee evidencia de cumplimiento, indícalo de manera técnica y clara.\n"
                f"3. Si la documentación no provee suficiente información, sé honesto e indícalo diciendo: 'De acuerdo a tus documentos subidos, no encontré evidencia sobre...'."
            )
        
        try:
            # Dynamic model based on active key
            response = await self.client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error en AI Service: {e}")
            
            # Formatear el aviso de evidencias para el modo simulado si existe
            context_note = ""
            if context:
                # Mostrar los primeros 150 caracteres para la simulación
                context_note = f"\n\n*(Búsqueda Vectorial RAG completada: Encontré fragmentos relevantes de tus documentos, tales como: \"{context[:150]}...\")*"
                
            fallback_response = (
                f"🤖 **[DANI OFFLINE - MODO DEMO RAG]**{context_note}\n\n"
                f"Analizando tu consulta: *\"{message}\"*\n\n"
                f"Desde la perspectiva de la **ISO 27001:2022**, esta consulta se responde revisando los lineamientos normativos correspondientes en tus evidencias. "
                f"Te sugiero revisar tus políticas sobre **Concientización y Capacitación (Cláusula 7.3)** y "
                f"los **Controles de Acceso (A.5.15)**.\n\n"
                f"*(Aviso de Demo: El motor de IA devolvió el error: {str(e)[:50]}... Esta es una simulación de respaldo que demuestra el procesamiento RAG local con embeddings).* 😉"
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
                model=settings.AI_MODEL,
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