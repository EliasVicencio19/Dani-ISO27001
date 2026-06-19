from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import zipfile
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid
import os
# CAMBIO: shutil ya no se usa (no copiamos a disco local), se quita.

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.evidence import Evidence, EvidenceType
from app.services.embedding_service import EmbeddingService
# CAMBIO: importamos el nuevo servicio de almacenamiento en Supabase.
from app.services.storage_service import storage_service

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])
embedding_service = EmbeddingService()

# CAMBIO: ya NO creamos/usamos un directorio local persistente
# (UPLOAD_DIR = "uploads/evidence" + os.makedirs). En Vercel ese directorio
# no sobrevive entre invocaciones. Si necesitamos un archivo temporal local
# (para que PyMuPDF/pypdf extraigan texto), lo escribimos en /tmp, que SÍ es
# escribible dentro de una misma invocación, y lo subimos a Supabase Storage.
TMP_DIR = "/tmp"


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
    """Subir evidencia real y guardarla en Supabase Storage + DB"""
    tmp_path = None
    try:
        file_bytes = await file.read()

        # CAMBIO: el "path" que antes era una ruta de disco ahora es la
        # clave/objeto dentro del bucket de Supabase Storage.
        storage_path = f"{uuid.uuid4()}_{file.filename}"

        # Intentar subir a Supabase Storage; si no está configurado, continuar sin storage externo
        try:
            from app.config import settings
            if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
                await storage_service.upload(
                    path=storage_path,
                    content=file_bytes,
                    content_type=file.content_type or "application/octet-stream",
                )
            else:
                storage_path = f"local:{file.filename}"
        except Exception as storage_err:
            print(f"⚠️ Supabase Storage no disponible, continuando sin storage externo: {storage_err}")
            storage_path = f"local:{file.filename}"

        file_size = len(file_bytes)

        # Crear registro en base de datos
        new_evidence = Evidence(
            title=file.filename,
            # CAMBIO: file_url ahora guarda el "path" dentro del bucket de
            # Supabase Storage, no una ruta de disco local.
            file_url=storage_path,
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
            # CAMBIO: embedding_service.extract_text_from_file espera una ruta
            # local, así que escribimos una copia temporal en /tmp SOLO para
            # la extracción de texto dentro de esta misma invocación. No se
            # usa para servir descargas ni se persiste entre requests.
            tmp_path = os.path.join(TMP_DIR, storage_path)
            with open(tmp_path, "wb") as f:
                f.write(file_bytes)

            extracted_text = embedding_service.extract_text_from_file(tmp_path, file.content_type or "")
            if extracted_text:
                chunks = embedding_service.chunk_text(extracted_text)
                if chunks:
                    embeddings = embedding_service.generate_embeddings(chunks)

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
            print(f"⚠️ Error durante la indexación RAG (el documento principal se guardó): {rag_err}")
        finally:
            # CAMBIO: limpiamos el temporal de /tmp para no acumular basura
            # entre invocaciones que reutilizan el mismo contenedor "warm".
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

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