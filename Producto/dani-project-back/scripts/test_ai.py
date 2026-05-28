import asyncio
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.services.ai_service import AIService

async def test():
    service = AIService()
    print("AI_MODEL:", service.client)
    res = await service.chat("Hola, dime que funcionas", context=None)
    print("RESPONSE:", res)

if __name__ == "__main__":
    asyncio.run(test())
