import openai
from app.config import settings

class DeepSeekService:
    def __init__(self):
        # Configuración compatible con OpenAI apuntando a DeepSeek
        self.client = openai.AsyncOpenAI(
            api_key=settings.DEEPSEEK_API_KEY, 
            base_url="https://api.deepseek.com" # Base URL oficial de DeepSeek
        )
        
    async def analyze_risk(self, risk: dict) -> dict:
        """Analyze risk using DeepSeek V4 Flash"""
        
        # Placeholder para el futuro RAG con Weaviate
        context = "Aquí irán los fragmentos recuperados de Weaviate."
        
        prompt = f"""
        As a security compliance expert for ISO 27001, analyze this risk:
        
        Title: {risk.get('title', 'N/A')}
        Description: {risk.get('description', 'N/A')}
        
        Context from Weaviate: {context}
        
        Please provide:
        1. Risk severity assessment
        2. Recommended controls based on ISO 27001 Annex A
        3. Action plan for mitigation
        """
        
        try:
            # Uso explícito del modelo Flash
            response = await self.client.chat.completions.create(
                model="deepseek-v4-flash", 
                messages=[
                    {"role": "system", "content": "Eres DANI, un experto consultor en ciberseguridad, operaciones de Blue Team y auditor líder ISO 27001. Tu objetivo es evaluar riesgos de manera técnica, crítica y estructurada. Responde siempre en español."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "model_used": "deepseek-v4-flash"
            }
        except Exception as e:
            return {"error": f"Error calling DeepSeek API: {str(e)}"}