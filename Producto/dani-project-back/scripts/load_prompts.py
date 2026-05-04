# scripts/load_prompts.py
import asyncio
import json
import os
from sqlalchemy import delete
from app.dependencies.database import engine, AsyncSessionLocal, Base
from app.models.prompt import AIPrompt

async def load_ai_prompts():
    print("🤖 Cargando Prompts de DANI en la base de datos...")
    
    # Ruta al archivo JSON
    file_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "ai_prompts.json")
    
    with open(file_path, "r", encoding="utf-8") as f:
        prompts_data = json.load(f)

    # Nos aseguramos de que la tabla exista
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Insertamos los prompts
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Limpiamos la tabla primero para evitar duplicados en recargas
            await session.execute(delete(AIPrompt))
            
            for p_data in prompts_data:
                prompt = AIPrompt(
                    name=p_data["name"],
                    category=p_data["category"],
                    description=p_data.get("description", ""),
                    system_prompt=p_data["system_prompt"],
                    user_prompt_template=p_data["user_prompt_template"]
                )
                session.add(prompt)
                
        print(f"✅ ¡Éxito! Se cargaron {len(prompts_data)} prompts en el cerebro de DANI.")

if __name__ == "__main__":
    asyncio.run(load_ai_prompts())