from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.dependencies.database import get_db
from app.services.ai_service import AIService
from app.services.embedding_service import EmbeddingService
from app.models.evidence_chunk import EvidenceChunk

router = APIRouter(prefix="/api/chat", tags=["Chat IA"])
ai_service = AIService()
embedding_service = EmbeddingService()

# Definimos el esquema exacto que envía tu archivo api.js de React
class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Recibe el mensaje de React, busca fragmentos de evidencia relevantes por similitud de vectores y responde con DANI"""
    context = ""
    try:
        # 1. Generar embedding de 384 dimensiones para la consulta
        query_vector = embedding_service.generate_single_embedding(request.message)
        
        # 2. Consultar similitud de coseno en PostgreSQL con pgvector ordenando por menor distancia
        # Eagerly load la relación 'evidence' para evitar errores de MissingGreenlet en SQLAlchemy async
        query_stmt = (
            select(EvidenceChunk)
            .options(selectinload(EvidenceChunk.evidence))
            .order_by(EvidenceChunk.embedding.cosine_distance(query_vector))
            .limit(3)
        )
        
        result = await db.execute(query_stmt)
        chunks = result.scalars().all()
        
        if chunks:
            # 3. Unir los fragmentos para crear el bloque de contexto inyectable
            context_blocks = []
            for chunk in chunks:
                control_ref = chunk.evidence.evidence_metadata.get("control", "General") if chunk.evidence else "General"
                context_blocks.append(f"--- Fragmento (Ref: {control_ref}): ---\n{chunk.content}")
            
            context = "\n\n".join(context_blocks)
            print(f"🔍 RAG: Contexto de {len(chunks)} fragmentos recuperado e inyectado con éxito.")
    except Exception as rag_err:
        # Recuperación de errores defensiva para evitar caídas en producción si la extensión pgvector no está lista
        print(f"⚠️ Error al recuperar contexto RAG: {rag_err}")

    # 4. Enviar a la IA (DeepSeek / Llama) enriqueciendo el prompt con las evidencias reales encontradas
    reply = await ai_service.chat(request.message, context=context if context else None)
    
    # Devolvemos la propiedad 'reply' mapeada por React
    return {"reply": reply}