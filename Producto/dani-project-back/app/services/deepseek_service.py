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
        """Analyze risk using DeepSeek V4 Flash y Prompts Dinámicos"""
        
        # 1. Traer la personalidad y el molde desde la BD
        prompt_data = await self.get_prompt_from_db(prompt_name)
        
        if not prompt_data:
            return {"error": f"No se encontró el prompt '{prompt_name}' en la base de datos."}

        # Placeholder para el futuro RAG con Weaviate
        context = "Aquí irán los fragmentos recuperados de Weaviate."
        
        # 2. Inyectar los datos del riesgo en el molde del prompt
        user_message = prompt_data.user_prompt_template.format(
            title=risk.get('title', 'N/A'),
            description=risk.get('description', 'N/A')
        )
        
        # Le añadimos el contexto al final de la petición
        user_message += f"\n\nContexto extraído de documentos: {context}"
        
        try:
            # Uso explícito del modelo Flash con la nueva personalidad
            response = await self.client.chat.completions.create(
                model="deepseek-v4-flash", 
                messages=[
                    {"role": "system", "content": prompt_data.system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "model_used": "deepseek-v4-flash",
                "prompt_used": prompt_name
            }
        except Exception as e:
            return {"error": f"Error llamando a DeepSeek API: {str(e)}"}