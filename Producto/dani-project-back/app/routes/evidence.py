from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
import zipfile
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.evidence import Evidence, EvidenceType
from app.services.embedding_service import EmbeddingService

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])
embedding_service = EmbeddingService()

# Crear directorio de uploads si no existe
UPLOAD_DIR = "uploads/evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
async def get_all_evidence(
    db: AsyncSession = Depends(get_db)
):
    """Obtener todas las evidencias desde la Base de Datos"""
    query = select(Evidence)
    result = await db.execute(query)
    evidences = result.scalars().all()
    
    return [
        {
            "id": ev.id,
            "name": ev.title,
            "control": ev.evidence_metadata.get("control", "N/A") if ev.evidence_metadata else "N/A",
            "type": ev.evidence_metadata.get("type", "manual") if ev.evidence_metadata else "manual",
            "source": ev.evidence_metadata.get("source", "Manual") if ev.evidence_metadata else "Manual",
            "sourceIcon": ev.evidence_metadata.get("sourceIcon", "📄") if ev.evidence_metadata else "📄",
            "lastUpdated": ev.verified_at.isoformat() if ev.verified_at else datetime.utcnow().isoformat(),
            "validityDays": ev.evidence_metadata.get("validityDays", 30) if ev.evidence_metadata else 30,
            "file_url": ev.file_url,
            "file_size": ev.file_size
        }
        for ev in evidences
    ]

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    control: str = Form("General"),
    source: str = Form("Manual"),
    validityDays: int = Form(30),
    db: AsyncSession = Depends(get_db)
):
    """Subir evidencia real y guardarla en DB"""
    try:
        # Guardar archivo localmente
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)

        # Crear registro en base de datos
        new_evidence = Evidence(
            title=file.filename,
            file_url=file_path,
            file_name=file.filename,
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            evidence_type=EvidenceType.DOCUMENT,
            verified_at=datetime.utcnow(),
            evidence_metadata={
                "control": control,
                "type": "manual",
                "source": source,
                "sourceIcon": "📄",
                "validityDays": validityDays
            }
        )
        
        db.add(new_evidence)
        await db.commit()
        await db.refresh(new_evidence)
        
        # 🛡️ RAG: Indexar documento en fragmentos vectoriales de forma defensiva
        try:
            # 1. Extraer texto completo del archivo cargado
            extracted_text = embedding_service.extract_text_from_file(file_path, file.content_type or "")
            if extracted_text:
                # 2. Particionar texto en fragmentos
                chunks = embedding_service.chunk_text(extracted_text)
                if chunks:
                    # 3. Generar representaciones vectoriales
                    embeddings = embedding_service.generate_embeddings(chunks)
                    
                    # 4. Almacenar fragmentos con sus vectores
                    from app.models.evidence_chunk import EvidenceChunk
                    for idx, (chunk_content, chunk_emb) in enumerate(zip(chunks, embeddings)):
                        chunk_obj = EvidenceChunk(
                            evidence_id=new_evidence.id,
                            content=chunk_content,
                            embedding=chunk_emb,
                            chunk_index=idx
                        )
                        db.add(chunk_obj)
                    await db.commit()
                    print(f"✅ Ingesta RAG completada: {len(chunks)} fragmentos indexados en BD para la evidencia: {new_evidence.id}")
        except Exception as rag_err:
            # Captura de errores defensiva para que el fallo en RAG no interrumpa la subida de evidencia
            print(f"⚠️ Error durante la indexación RAG (el documento principal se guardó): {rag_err}")
        
        return {
            "message": "Evidencia subida correctamente",
            "id": new_evidence.id,
            "filename": file.filename
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")

@router.get("/{evidence_id}/download")
async def download_evidence(
    evidence_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Descargar el archivo físico de una evidencia"""
    query = select(Evidence).where(Evidence.id == evidence_id)
    result = await db.execute(query)
    evidence = result.scalar_one_or_none()
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada en la base de datos")
        
    if not os.path.exists(evidence.file_url):
        raise HTTPException(status_code=404, detail="El archivo físico no se encuentra en el servidor")
        
    return FileResponse(
        path=evidence.file_url,
        filename=evidence.file_name,
        media_type=evidence.mime_type
    )

@router.get("/export/zip")
async def export_evidences_zip(db: AsyncSession = Depends(get_db)):
    """Exportar todas las evidencias reales en un archivo ZIP estructurado"""
    query = select(Evidence)
    result = await db.execute(query)
    evidences = result.scalars().all()
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, False) as zip_file:
        added_files = 0
        for ev in evidences:
            if os.path.exists(ev.file_url):
                # Organizar en carpetas por control
                control_folder = ev.evidence_metadata.get("control", "General") if ev.evidence_metadata else "General"
                control_folder = "".join(c for c in control_folder if c.isalnum() or c in " ._-")
                file_path_in_zip = f"{control_folder}/{ev.file_name}"
                zip_file.write(ev.file_url, file_path_in_zip)
                added_files += 1
                
        if added_files == 0:
            # Si no hay archivos, agregamos un leeme.txt para que el ZIP no sea inválido
            zip_file.writestr("LEEME.txt", "No hay evidencias físicas disponibles para exportar.")
                
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=ISO27001_Audit_Package.zip"
        }
    )