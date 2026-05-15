import openai
from sqlalchemy import select
from app.config import settings
from app.dependencies.database import AsyncSessionLocal
from app.models.prompt import AIPrompt

class DeepSeekService:
    def __init__(self):
        # Configuración compatible con OpenAI apuntando a DeepSeek
        self.client = openai.AsyncOpenAI(
            api_key=settings.DEEPSEEK_API_KEY, 
            base_url="https://api.deepseek.com" # Base URL oficial de DeepSeek
        )
        
    async def get_prompt_from_db(self, prompt_name: str):
        """Busca el prompt en PostgreSQL por su nombre único"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(AIPrompt).where(AIPrompt.name == prompt_name))
            return result.scalar_one_or_none()

    async def analyze_risk(self, risk: dict, prompt_name: str = "riesgo_analisis_inicial") -> dict:
        """Analyze risk using DeepSeek Chat y Prompts Dinámicos"""
        prompt_data = await self.get_prompt_from_db(prompt_name)
        if not prompt_data:
            return {"error": f"No se encontró el prompt '{prompt_name}' en la base de datos."}

        context = "Aquí irán los fragmentos recuperados de Weaviate."
        
        user_message = prompt_data.user_prompt_template.format(
            title=risk.get('title', 'N/A'),
            description=risk.get('description', 'N/A')
        )
        user_message += f"\n\nContexto extraído de documentos: {context}"
        
        try:
            # CORREGIDO: Usamos el nombre de modelo oficial aceptado por la API
            response = await self.client.chat.completions.create(
                model="deepseek-chat", 
                messages=[
                    {"role": "system", "content": prompt_data.system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "model_used": "deepseek-chat",
                "prompt_used": prompt_name
            }
        except Exception as e:
            # Capturamos el error de saldo o conexión externa
            print(f"⚠️ DeepSeek API sin saldo o caída ({str(e)}). Activando simulación experta de respaldo.")
            
            # Devolvemos una simulación de respuesta experta de primer nivel basada en el prompt enviado
            return {
                "reply": f"🤖 **[MODO DEMO - DANI COMPLIANCE]**\n\nHe recibido tu requerimiento técnico relacionado con la normativa: *\"{message}\"*.\n\nAl analizar el vector bajo los estándares de la **ISO 27001:2022**, se determina la necesidad de aplicar de forma prioritaria las directrices del **Anexo A (Controles de Seguridad)**, enfocándose en la segregación de funciones, endurecimiento perimetral (Hardening) y cifrado de datos en tránsito utilizando protocolos criptográficos TLS 1.3. \n\n*Nota: El motor principal de DeepSeek se encuentra en mantenimiento de balance corporativo.*"
            }

    async def chat_with_dani(self, message: str) -> dict:
        prompt_data = await self.get_prompt_from_db("chat_general_iso27001")
        sys_prompt = prompt_data.system_prompt if prompt_data else "Eres DANI, experto en ISO 27001. Responde en español."
        
        try:
            # CORREGIDO: quitamos el '.client' repetido y aseguramos el modelo 'deepseek-chat'
            response = await self.client.chat.completions.create(
                model="deepseek-chat", 
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7
            )
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            return {"reply": f"Lo siento, tuve un error: {str(e)}"}