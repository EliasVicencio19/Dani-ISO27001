from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.services.ai_service import AIService
from app.services.embedding_service import EmbeddingService
from app.models.evidence_chunk import EvidenceChunk
from app.models.normative_chunk import NormativeChunk

router = APIRouter(prefix="/api/chat", tags=["Chat IA"])
ai_service = AIService()
embedding_service = EmbeddingService()

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "es"

@router.post("/")
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Recibe el mensaje de React, busca fragmentos tanto en las evidencias subidas 
    como en la base normativa oficial (ISO 27001 / ISO 27002), e inyecta ambos como contexto a DANI.
    """
    context = ""
    context_blocks = []
    
    try:
        # 1. Generar embedding de 384 dimensiones para la consulta
        query_vector = embedding_service.generate_single_embedding(request.message)
        
        # 2. Consultar similitud de coseno en pgvector - Evidencias del cliente
        try:
            from app.models.evidence import Evidence
            
            ev_stmt = (
                select(EvidenceChunk)
                .join(EvidenceChunk.evidence)
                .options(selectinload(EvidenceChunk.evidence))
            )
            
            # 🛡️ Control de Accesos (RBAC): Empleados solo pueden extraer fragmentos de las evidencias que ellos mismos subieron
            if current_user.get("role") == "employee":
                ev_stmt = ev_stmt.where(Evidence.uploaded_by == current_user["user_id"])
                
            ev_stmt = ev_stmt.order_by(EvidenceChunk.embedding.cosine_distance(query_vector)).limit(3)
            
            ev_result = await db.execute(ev_stmt)
            ev_chunks = ev_result.scalars().all()
            for chunk in ev_chunks:
                control_ref = chunk.evidence.evidence_metadata.get("control", "General") if chunk.evidence else "General"
                context_blocks.append(
                    f"--- EVIDENCIA INTERNA DE LA ORGANIZACIÓN (Control: {control_ref}) ---\n"
                    f"Documento de evidencia: {chunk.evidence.title if chunk.evidence else 'Sin título'}\n"
                    f"Texto extraído: {chunk.content}"
                )
        except Exception as ev_err:
            print(f"⚠️ Error al consultar EvidenceChunk en RAG: {ev_err}")
            raise HTTPException(status_code=503, detail="Servicio Analítico Degradado: Fallo en consulta de evidencias (RAG).")

        # 3. Consultar similitud de coseno en pgvector - Base Normativa ISO Oficial
        try:
            norm_stmt = (
                select(NormativeChunk)
                .order_by(NormativeChunk.embedding.cosine_distance(query_vector))
                .limit(3)
            )
            norm_result = await db.execute(norm_stmt)
            norm_chunks = norm_result.scalars().all()
            for chunk in norm_chunks:
                context_blocks.append(
                    f"--- NORMATIVA OFICIAL ({chunk.document_name} | Cláusula: {chunk.clause}) ---\n"
                    f"Requisito/Guía: {chunk.content}"
                )
        except Exception as norm_err:
            print(f"⚠️ Error al consultar NormativeChunk en RAG: {norm_err}")
            raise HTTPException(status_code=503, detail="Servicio Analítico Degradado: Fallo en consulta de normativa (RAG).")
            
        if context_blocks:
            context = "\n\n".join(context_blocks)
            print(f"🔍 RAG: Contexto combinado inyectado con éxito ({len(context_blocks)} fragmentos).")
            
    except HTTPException:
        raise
    except Exception as rag_err:
        print(f"⚠️ Error general al recuperar contexto RAG: {rag_err}")
        raise HTTPException(status_code=503, detail="Servicio Analítico Degradado: Fallo general en el motor RAG.")

    # Inyectar instrucción de idioma
    lang_map = {"es": "Español", "en": "Inglés (English)", "pt": "Portugués (Português)"}
    target_lang = lang_map.get(request.language, "Español")
    lang_instruction = f"INSTRUCCIÓN CRÍTICA DEL SISTEMA: El usuario ha seleccionado el idioma '{target_lang}'. Por lo tanto, tu respuesta FINAL debe estar EXCLUSIVAMENTE en {target_lang}, independientemente del idioma del contexto o de la pregunta."
    
    if context:
        context = f"{context}\n\n{lang_instruction}"
    else:
        context = lang_instruction

    # 4. Enviar a la IA (DeepSeek) enriqueciendo el prompt con todo el contexto recuperado
    reply = await ai_service.chat(request.message, context=context)
    
    return {"reply": reply}