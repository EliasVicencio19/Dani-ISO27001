# test_deepseek.py
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Usar DeepSeek
api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")

print("=== Probando DeepSeek API ===")
print(f"API Key: {api_key[:20] if api_key else 'No encontrada'}...")

if not api_key:
    print("❌ No se encontró API key")
else:
    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Responde solo 'Hola, DeepSeek funciona correctamente'"}
            ],
            max_tokens=50
        )
        
        print("\n✅ Conexión exitosa con DeepSeek!")
        print(f"Respuesta: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")