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
    """Exportar paquete de auditoría ISO 27001 estructurado por cláusulas"""
    from app.models.risk import Risk
    from app.models.gap_analysis import GapAnalysis
    import json

    # Cargar datos reales de la BD
    ev_result = await db.execute(select(Evidence))
    evidences = ev_result.scalars().all()

    risk_result = await db.execute(select(Risk))
    risks = risk_result.scalars().all()

    clause_folders = {
        "4": "Clausula_4_Contexto",
        "5": "Clausula_5_Liderazgo",
        "6": "Clausula_6_Planificacion",
        "7": "Clausula_7_Soporte",
        "8": "Clausula_8_Operacion",
        "9": "Clausula_9_Evaluacion",
        "10": "Clausula_10_Mejora",
        "A": "Anexo_A_Controles",
    }

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, False) as zf:

        # 1. Índice general
        index_lines = [
            "PAQUETE DE AUDITORÍA ISO 27001:2022",
            f"Generado: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            "=" * 50,
            "",
            "CONTENIDO:",
            f"  - Evidencias registradas: {len(evidences)}",
            f"  - Riesgos identificados:  {len(risks)}",
            "",
            "ESTRUCTURA DE CARPETAS:",
        ]
        for key, folder in clause_folders.items():
            index_lines.append(f"  {folder}/")
        index_lines += ["  Riesgos/", "  Resumen/"]
        zf.writestr("INDICE.txt", "\n".join(index_lines))

        # 2. Evidencias organizadas por cláusula
        for ev in evidences:
            ctrl = (ev.evidence_metadata or {}).get("control", "") if ev.evidence_metadata else ""
            prefix = ctrl.split(".")[0] if ctrl else ""
            folder = clause_folders.get(prefix, "Anexo_A_Controles" if ctrl.startswith("A") else "Evidencias_Generales")

            content = "\n".join([
                f"EVIDENCIA: {ev.title}",
                f"Control ISO: {ctrl or 'N/A'}",
                f"Tipo: {(ev.evidence_metadata or {}).get('type', 'manual')}",
                f"Fuente: {(ev.evidence_metadata or {}).get('source', 'Manual')}",
                f"Fecha: {ev.verified_at.strftime('%Y-%m-%d') if ev.verified_at else 'Sin fecha'}",
                f"Descripcion: {ev.description or 'Sin descripcion'}",
                f"Tamaño archivo: {ev.file_size or 0} bytes",
            ])
            safe_name = "".join(c for c in ev.title if c.isalnum() or c in " ._-")[:50]
            zf.writestr(f"{folder}/{safe_name}.txt", content)

            # Si existe el archivo físico, incluirlo también
            if ev.file_url and os.path.exists(ev.file_url):
                zf.write(ev.file_url, f"{folder}/{ev.file_name}")

        # 3. Reporte de riesgos
        risk_lines = [
            "REGISTRO DE RIESGOS ISO 27001",
            f"Total: {len(risks)} riesgos",
            "=" * 50,
            "",
        ]
        for r in risks:
            risk_lines += [
                f"ID: {r.id}",
                f"Titulo: {r.title}",
                f"Categoria: {r.category.value if r.category else 'N/A'}",
                f"Probabilidad: {r.likelihood}/5  |  Impacto: {r.impact}/5",
                f"Nivel: {r.risk_level.value if r.risk_level else 'N/A'}",
                f"Estado: {r.status.value if r.status else 'N/A'}",
                f"Responsable: {r.owner}",
                f"Plan de mitigacion: {r.mitigation_plan or 'Sin plan'}",
                "-" * 40,
                "",
            ]
        zf.writestr("Riesgos/Registro_de_Riesgos.txt", "\n".join(risk_lines))

        # 4. Resumen ejecutivo
        resumen = "\n".join([
            "RESUMEN EJECUTIVO - SGSI ISO 27001:2022",
            f"Fecha: {datetime.utcnow().strftime('%Y-%m-%d')}",
            "=" * 50,
            "",
            f"Evidencias documentadas: {len(evidences)}",
            f"Riesgos identificados:   {len(risks)}",
            f"Riesgos criticos:        {sum(1 for r in risks if r.risk_level and r.risk_level.value == 'critical')}",
            f"Riesgos altos:           {sum(1 for r in risks if r.risk_level and r.risk_level.value == 'high')}",
            "",
            "Este paquete fue generado automaticamente por DANI ISO 27001.",
        ])
        zf.writestr("Resumen/Resumen_Ejecutivo.txt", resumen)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=ISO27001_Audit_Package.zip"}
    )