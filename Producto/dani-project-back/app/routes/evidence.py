from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
import zipfile
import io
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid
import os

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db, AsyncSessionLocal
from app.models.evidence import Evidence, EvidenceType
from app.services.embedding_service import EmbeddingService
from app.services.storage_service import storage_service

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])
embedding_service = EmbeddingService()

TMP_DIR = "/tmp"


async def _index_evidence_background(evidence_id: str, file_bytes: bytes, mime_type: str, tmp_path: str):
    """Procesa el RAG en background sin bloquear el request de upload."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
            evidence = result.scalar_one_or_none()
            if not evidence:
                return

            evidence.indexing_status = "indexing"
            await db.commit()

            os.makedirs(TMP_DIR, exist_ok=True)
            with open(tmp_path, "wb") as f:
                f.write(file_bytes)

            extracted_text = embedding_service.extract_text_from_file(tmp_path, mime_type)
            if extracted_text:
                chunks = embedding_service.chunk_text(extracted_text)
                if chunks:
                    embeddings = embedding_service.generate_embeddings(chunks)
                    from app.models.evidence_chunk import EvidenceChunk
                    for idx, (chunk_content, chunk_emb) in enumerate(zip(chunks, embeddings)):
                        db.add(EvidenceChunk(
                            evidence_id=evidence_id,
                            content=chunk_content,
                            embedding=chunk_emb,
                            chunk_index=idx
                        ))

            evidence.indexing_status = "done"
            await db.commit()
            print(f"✅ RAG completado para evidencia {evidence_id}")
        except Exception as e:
            print(f"⚠️ Error RAG background para {evidence_id}: {e}")
            try:
                result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
                ev = result.scalar_one_or_none()
                if ev:
                    ev.indexing_status = "error"
                    await db.commit()
            except Exception:
                pass
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    control: str = Form("General"),
    source: str = Form("Manual"),
    validityDays: int = Form(30),
    db: AsyncSession = Depends(get_db)
):
    """Sube la evidencia a BD y lanza la indexación RAG en background."""
    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
        # Sanitizar nombre: solo ASCII alfanumérico, puntos y guiones
        import unicodedata
        safe_filename = unicodedata.normalize('NFKD', file.filename).encode('ascii', 'ignore').decode('ascii')
        safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in "._-") or "file"
        storage_path = f"{uuid.uuid4()}_{safe_filename}"

        try:
            from app.config import settings
            print(f"🔧 SUPABASE_URL={settings.SUPABASE_URL!r}  BUCKET={settings.SUPABASE_STORAGE_BUCKET!r}")
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
                await storage_service.upload(
                    path=storage_path,
                    content=file_bytes,
                    content_type=file.content_type or "application/octet-stream",
                )
                print(f"✅ Archivo subido a Supabase Storage: {storage_path}")
            else:
                print("⚠️ Supabase no configurado, usando local")
                storage_path = f"local:{file.filename}"
        except Exception as se:
            print(f"❌ Error Supabase Storage: {se}")
            storage_path = f"local:{file.filename}"

        now = datetime.utcnow()
        new_evidence = Evidence(
            title=file.filename,
            file_url=storage_path,
            file_name=file.filename,
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            evidence_type=EvidenceType.DOCUMENT,
            verified_at=now,
            indexing_status="pending",
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

        evidence_id = new_evidence.id
        safe_name = "".join(c for c in file.filename if c.isalnum() or c in "._-")[:60]
        tmp_path = os.path.join(TMP_DIR, f"{evidence_id}_{safe_name}")
        mime = file.content_type or ""

        # Lanzar indexación RAG en background — el request responde inmediato
        background_tasks.add_task(
            _index_evidence_background, evidence_id, file_bytes, mime, tmp_path
        )

        return {
            "message": "Evidencia subida correctamente. Indexando en segundo plano...",
            "id": evidence_id,
            "filename": file.filename,
            "indexing_status": "pending"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")


@router.get("/{evidence_id}/status")
async def get_evidence_status(
    evidence_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Consulta el estado de indexación RAG de una evidencia."""
    result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
    ev = result.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    return {"id": evidence_id, "indexing_status": ev.indexing_status or "done"}


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

    # CAMBIO: antes se verificaba os.path.exists(evidence.file_url) y se
    # devolvía con FileResponse desde disco. Ahora descargamos el contenido
    # desde Supabase Storage y lo devolvimos como stream.
    try:
        content = await storage_service.download(evidence.file_url)
    except Exception:
        raise HTTPException(status_code=404, detail="El archivo físico no se encuentra en Supabase Storage")

    return StreamingResponse(
        io.BytesIO(content),
        media_type=evidence.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{evidence.file_name}"'}
    )


def _make_pdf(title: str, subtitle: str, sections: list) -> bytes:
    """Genera un PDF profesional con PyMuPDF. sections = [(heading, [(label, value), ...])]"""
    # (sin cambios respecto al original — se omite aquí por espacio,
    # cópialo tal cual lo tienes en tu archivo actual)
    ...


@router.get("/export/zip")
async def export_evidences_zip(db: AsyncSession = Depends(get_db)):
    """Exportar paquete de auditoría ISO 27001 con PDFs profesionales por cláusula"""
    from app.models.risk import Risk

    ev_result = await db.execute(select(Evidence))
    evidences = ev_result.scalars().all()

    risk_result = await db.execute(select(Risk))
    risks = risk_result.scalars().all()

    clause_folders = {
        "4":  "Clausula_4_Contexto",
        "5":  "Clausula_5_Liderazgo",
        "6":  "Clausula_6_Planificacion",
        "7":  "Clausula_7_Soporte",
        "8":  "Clausula_8_Operacion",
        "9":  "Clausula_9_Evaluacion",
        "10": "Clausula_10_Mejora",
    }
    clause_names = {
        "4": "Contexto de la Organizacion",
        "5": "Liderazgo",
        "6": "Planificacion",
        "7": "Soporte",
        "8": "Operacion",
        "9": "Evaluacion del Desempeno",
        "10": "Mejora Continua",
    }

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, False) as zf:

        ev_by_clause: dict = {k: [] for k in clause_folders}
        ev_general = []
        for ev in evidences:
            ctrl = (ev.evidence_metadata or {}).get("control", "") if ev.evidence_metadata else ""
            prefix = ctrl.split(".")[0] if ctrl else ""
            if prefix in ev_by_clause:
                ev_by_clause[prefix].append(ev)
            else:
                ev_general.append(ev)

        for prefix, folder in clause_folders.items():
            evs = ev_by_clause[prefix]
            clause_name = clause_names[prefix]
            sections = []
            if evs:
                for ev in evs:
                    ctrl = (ev.evidence_metadata or {}).get("control", "N/A") if ev.evidence_metadata else "N/A"
                    sections.append((f"Evidencia: {ev.title[:60]}", [
                        ("Control ISO 27001", ctrl),
                        ("Tipo", (ev.evidence_metadata or {}).get("type", "manual")),
                        ("Fuente", (ev.evidence_metadata or {}).get("source", "Manual")),
                        ("Fecha verificacion", ev.verified_at.strftime("%d/%m/%Y") if ev.verified_at else "Sin fecha"),
                        ("Descripcion", ev.description or "Sin descripcion"),
                        ("Tamano archivo", f"{ev.file_size or 0} bytes"),
                    ]))
            else:
                sections.append(("Sin evidencias registradas", [
                    ("Estado", "Pendiente de documentacion"),
                    ("Recomendacion", "Agregar evidencias desde el Centro de Evidencias"),
                ]))

            pdf_bytes = _make_pdf(
                f"Clausula {prefix} - {clause_name}",
                f"Evidencias ISO 27001:2022 | {len(evs)} documento(s)",
                sections
            )
            zf.writestr(f"{folder}/Evidencias_Clausula_{prefix}.pdf", pdf_bytes)

            # CAMBIO: antes -> `if ev.file_url and os.path.exists(ev.file_url): zf.write(...)`
            # leía del disco local. Ahora descargamos cada archivo desde
            # Supabase Storage y lo escribimos directo en el zip en memoria.
            for ev in evs:
                if not ev.file_url:
                    continue
                try:
                    file_bytes = await storage_service.download(ev.file_url)
                except Exception:
                    continue  # si un archivo individual falla, no rompemos todo el export
                safe = "".join(c for c in (ev.file_name or ev.title) if c.isalnum() or c in " ._-")[:50]
                zf.writestr(f"{folder}/{safe}", file_bytes)

        # --- PDF Registro de Riesgos y Resumen Ejecutivo: sin cambios ---
        risk_sections = []
        for r in risks:
            risk_sections.append((r.title[:70], [
                ("Categoria",    r.category.value if r.category else "N/A"),
                ("Probabilidad", f"{r.likelihood}/5"),
                ("Impacto",      f"{r.impact}/5"),
                ("Nivel",        r.risk_level.value if r.risk_level else "N/A"),
                ("Estado",       r.status.value if r.status else "N/A"),
                ("Responsable",  r.owner),
                ("Plan de mitigacion", r.mitigation_plan or "Sin plan definido"),
            ]))
        if not risk_sections:
            risk_sections = [("Sin riesgos registrados", [("Estado", "No hay riesgos en el sistema")])]

        risk_pdf = _make_pdf(
            "Registro de Riesgos",
            f"ISO 27001:2022 - Gestion de Riesgos | {len(risks)} riesgo(s)",
            risk_sections
        )
        zf.writestr("Riesgos/Registro_de_Riesgos.pdf", risk_pdf)

        criticos = sum(1 for r in risks if r.risk_level and r.risk_level.value == "critical")
        altos    = sum(1 for r in risks if r.risk_level and r.risk_level.value == "high")
        medios   = sum(1 for r in risks if r.risk_level and r.risk_level.value == "medium")
        bajos    = sum(1 for r in risks if r.risk_level and r.risk_level.value == "low")

        resumen_pdf = _make_pdf(
            "Resumen Ejecutivo SGSI",
            "Paquete de Auditoria ISO 27001:2022",
            [
                ("Metricas Generales", [
                    ("Evidencias documentadas",    str(len(evidences))),
                    ("Riesgos identificados",      str(len(risks))),
                    ("Riesgos criticos",           str(criticos)),
                    ("Riesgos altos",              str(altos)),
                    ("Riesgos medios",             str(medios)),
                    ("Riesgos bajos",              str(bajos)),
                    ("Clausulas cubiertas",        f"{sum(1 for v in ev_by_clause.values() if v)} de 7"),
                ]),
                ("Informacion del Paquete", [
                    ("Estandar",   "ISO/IEC 27001:2022"),
                    ("Generado",   datetime.utcnow().strftime("%d/%m/%Y %H:%M UTC")),
                    ("Plataforma", "DANI GRC Platform"),
                    ("Clasificacion", "CONFIDENCIAL"),
                ]),
            ]
        )
        zf.writestr("Resumen/Resumen_Ejecutivo.pdf", resumen_pdf)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=ISO27001_Audit_Package.zip"}
    )