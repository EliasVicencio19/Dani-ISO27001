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

def _make_pdf(title: str, subtitle: str, sections: list) -> bytes:
    """Genera un PDF profesional con PyMuPDF. sections = [(heading, [(label, value), ...])]"""
    import fitz

    doc = fitz.open()
    W, H = 595, 842  # A4

    # Colores corporativos
    C_GREEN  = (0.063, 0.725, 0.506)   # #10b981
    C_DARK   = (0.086, 0.118, 0.157)   # #161E28
    C_GRAY   = (0.42, 0.45, 0.50)
    C_WHITE  = (1, 1, 1)
    C_LINE   = (0.88, 0.90, 0.92)
    C_BADGE  = {
        "critical": ((0.93, 0.27, 0.27), "CRITICO"),
        "high":     ((0.96, 0.62, 0.04), "ALTO"),
        "medium":   ((0.25, 0.60, 0.96), "MEDIO"),
        "low":      ((0.063, 0.725, 0.506), "BAJO"),
        "open":       ((0.96, 0.62, 0.04), "ABIERTO"),
        "in_review":  ((0.25, 0.60, 0.96), "EN REVISION"),
        "mitigated":  ((0.063, 0.725, 0.506), "MITIGADO"),
        "closed":     ((0.42, 0.45, 0.50), "CERRADO"),
        "security":    (C_GREEN, "SEGURIDAD"),
        "operational": ((0.25, 0.60, 0.96), "OPERACIONAL"),
        "compliance":  ((0.58, 0.27, 0.96), "CUMPLIMIENTO"),
        "privacy":     ((0.96, 0.27, 0.62), "PRIVACIDAD"),
        "third_party": ((0.96, 0.62, 0.04), "TERCEROS"),
    }

    def new_page():
        p = doc.new_page(width=W, height=H)
        # Header verde
        p.draw_rect(fitz.Rect(0, 0, W, 72), color=None, fill=C_GREEN)
        p.insert_text((32, 28), "DANI ISO 27001", fontsize=13, color=C_WHITE, fontname="helv")
        p.insert_text((32, 48), "Sistema de Gestion de Seguridad de la Informacion", fontsize=8, color=(0.8, 1, 0.9), fontname="helv")
        # Fecha arriba derecha
        fecha = datetime.utcnow().strftime("%d/%m/%Y")
        p.insert_text((W - 90, 44), fecha, fontsize=9, color=C_WHITE, fontname="helv")
        # Footer
        p.draw_rect(fitz.Rect(0, H - 28, W, H), color=None, fill=C_DARK)
        p.insert_text((32, H - 10), "Confidencial - ISO 27001:2022 | DANI GRC Platform", fontsize=7, color=(0.6, 0.6, 0.6), fontname="helv")
        p.insert_text((W - 70, H - 10), f"Pag. {doc.page_count}", fontsize=7, color=(0.6, 0.6, 0.6), fontname="helv")
        return p

    # --- PORTADA ---
    page = new_page()
    page.draw_rect(fitz.Rect(32, 100, W - 32, 102), color=None, fill=C_GREEN)
    page.insert_text((32, 140), title, fontsize=20, color=C_DARK, fontname="helv")
    page.insert_text((32, 168), subtitle, fontsize=11, color=C_GRAY, fontname="helv")
    page.draw_rect(fitz.Rect(32, 190, W - 32, 191), color=None, fill=C_LINE)
    page.insert_text((32, 215), f"Generado el {datetime.utcnow().strftime('%d de %B de %Y a las %H:%M UTC')}", fontsize=9, color=C_GRAY, fontname="helv")
    page.insert_text((32, 232), "Clasificacion: CONFIDENCIAL", fontsize=9, color=(0.93, 0.27, 0.27), fontname="helv")

    # --- PÁGINAS DE CONTENIDO ---
    y = 0
    page = None

    def ensure_space(needed=20):
        nonlocal y, page
        if page is None or y + needed > H - 50:
            page = new_page()
            y = 90

    for heading, rows in sections:
        ensure_space(40)
        # Encabezado de sección
        page.draw_rect(fitz.Rect(32, y, W - 32, y + 24), color=None, fill=C_DARK)
        page.insert_text((40, y + 16), heading.upper(), fontsize=9, color=C_WHITE, fontname="helv")
        y += 32

        for label, value in rows:
            ensure_space(18)
            val_str = str(value) if value is not None else "N/A"

            # Badge de color para campos especiales
            badge_info = C_BADGE.get(val_str.lower())
            if badge_info and label.lower() in ("nivel", "estado", "categoria"):
                bcolor, btext = badge_info
                bw = len(btext) * 5.5 + 12
                page.draw_rect(fitz.Rect(200, y, 200 + bw, y + 14), color=None, fill=bcolor)
                page.insert_text((204, y + 10), btext, fontsize=7, color=C_WHITE, fontname="helv")
            else:
                # Valor normal (truncar si muy largo)
                if len(val_str) > 80:
                    val_str = val_str[:80] + "..."
                page.insert_text((200, y + 10), val_str, fontsize=8, color=C_DARK, fontname="helv")

            page.insert_text((36, y + 10), label, fontsize=8, color=C_GRAY, fontname="helv")
            y += 18

            # Línea separadora ligera
            page.draw_rect(fitz.Rect(32, y, W - 32, y + 0.5), color=None, fill=C_LINE)
            y += 6

        y += 8

    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


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

        # 1. Un PDF por cláusula con sus evidencias
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

            # Incluir archivos físicos si existen
            for ev in evs:
                if ev.file_url and os.path.exists(ev.file_url):
                    safe = "".join(c for c in (ev.file_name or ev.title) if c.isalnum() or c in " ._-")[:50]
                    zf.write(ev.file_url, f"{folder}/{safe}")

        # 2. PDF Registro de Riesgos
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

        # 3. PDF Resumen Ejecutivo
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