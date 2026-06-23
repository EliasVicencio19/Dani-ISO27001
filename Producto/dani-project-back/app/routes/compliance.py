# app/routes/compliance.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, Optional, List
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select
from app.dependencies.database import AsyncSessionLocal, get_db
from app.models.iso_controls import ISOCControl

from sqlalchemy.ext.asyncio import AsyncSession  # <--- Agrega esta línea

from app.services.iso_compliance_analyzer import ISOComplianceAnalyzer
from app.dependencies.auth import get_current_user

# Definimos el prefijo limpio alineado con api.js de React
router = APIRouter(prefix="/api/compliance", tags=["ISO 27001 Compliance"])
analyzer = ISOComplianceAnalyzer()

# ===================================================================
# 🛠️ ESQUEMA FLEXIBLE: Soporta tanto 'applicable' como 'applies'
# ===================================================================
class SingleControlSchema(BaseModel):
    id: str
    applicable: Optional[bool] = True  # Soporte para el mock de React
    status: str
    justification: Optional[str] = None

class FullAssessmentRequest(BaseModel):
    controls: List[SingleControlSchema]

@router.get("/controls")
async def get_all_controls(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)  # ✅ esta es la sesión
):
    """Retorna los controles."""
    if category:
        controls = analyzer.get_controls_by_category(category)
        return {"category": category, "total": len(controls), "controls": controls}
    
    # ✅ Usar la sesión inyectada, no crear una nueva
    stmt = select(ISOCControl)
    result = await db.execute(stmt)
    db_controls = result.scalars().all()
    
    if db_controls:
        def _map_status(s: str) -> str:
            s = (s or "").lower()
            if "implementado" in s and "no" not in s:
                return "implemented"
            if "planificado" in s or "planned" in s:
                return "planned"
            return "notImplemented"

        return {
            "controls": [
                {
                    "id": c.control_id,
                    "name": c.title,
                    "description": c.description,
                    "category": c.category,
                    "applicable": c.applies,
                    "status": _map_status(c.status),
                    "justification": c.justification
                } for c in db_controls
            ]
        }
    
    return analyzer.get_all_controls()

@router.get("/statistics")
async def get_statistics(current_user: dict = Depends(get_current_user)):
    data = analyzer.get_all_controls()
    return {
        "standard": data.get("standard"),
        "version": data.get("version"),
        "total_controls": data.get("total_controls", 0),
        "distribution": data.get("controls_by_category", {})
    }

@router.post("/full-assessment")
async def full_assessment(
    payload: FullAssessmentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Procesa y guarda de forma persistente la matriz en Neon.tech"""
    async with AsyncSessionLocal() as session:
        try:
            updated_count = 0
            for ctrl_data in payload.controls:
                # Buscamos por el código identificador (ej: "A.5.1")
                stmt = select(ISOCControl).where(ISOCControl.control_id == ctrl_data.id)
                result = await session.execute(stmt)
                db_control = result.scalar_one_or_none()
                
                if db_control:
                    db_control.applies = ctrl_data.applicable
                    
                    # Normalizamos los estados de la interfaz hacia el estándar de base de datos
                    status_clean = ctrl_data.status.lower()
                    if "implemented" in status_clean or "implementado" in status_clean:
                        db_control.status = "Implementado"
                    elif "planned" in status_clean or "planificado" in status_clean:
                        db_control.status = "Planificado"
                    else:
                        db_control.status = "No Implementado"
                        
                    if ctrl_data.justification:
                        db_control.justification = ctrl_data.justification
                    updated_count += 1
            
            await session.commit()
            return {
                "status": "success",
                "message": f"Se actualizaron exitosamente {updated_count} controles.",
                "assessment_date": datetime.utcnow().isoformat()
            }
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error transaccional: {str(e)}")

from pydantic import BaseModel
class EvaluateRequest(BaseModel):
    document_id: str

@router.post("/{control_id}/evaluate")
async def evaluate_control(
    control_id: str,
    payload: EvaluateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Evalúa un control contra un documento específico usando IA"""
    from app.models.document import Document
    
    async with AsyncSessionLocal() as session:
        # Obtener el control por código ISO (ej: "5.1"), no por UUID
        stmt = select(ISOCControl).where(ISOCControl.control_id == control_id)
        result = await session.execute(stmt)
        db_control = result.scalar_one_or_none()
        
        if not db_control:
            raise HTTPException(status_code=404, detail="Control no encontrado")
            
        # Obtener el documento (asumiremos document_id es chapter_id o uuid)
        doc_stmt = select(Document).where(Document.id == payload.document_id)
        doc_result = await session.execute(doc_stmt)
        db_document = doc_result.scalar_one_or_none()
        
        if not db_document:
            raise HTTPException(status_code=404, detail="Documento no encontrado")
            
        if not db_document.content:
            raise HTTPException(status_code=400, detail="El documento está vacío")
            
        # Llamar a la IA
        evaluation = await analyzer.ai_service.evaluate_compliance(
            document_text=db_document.content,
            control_title=db_control.title,
            control_desc=db_control.description
        )
        
        # Actualizar la base de datos con el veredicto
        db_control.score = evaluation.get("score", 0)
        db_control.document_id = payload.document_id
        db_control.justification = evaluation.get("justification", "")
        
        # Traducir status de la IA al formato de BD que definió Elías
        ai_status = evaluation.get("status", "notImplemented").lower()
        if "implemented" in ai_status:
            db_control.status = "Implementado"
        elif "planned" in ai_status:
            db_control.status = "Planificado"
        else:
            db_control.status = "No Implementado"
            
        await session.commit()
        await session.refresh(db_control)
        
        return {
            "message": "Evaluación IA completada",
            "score": db_control.score,
            "status": ai_status,
            "justification": db_control.justification
        }

@router.post("/bulk-audit")
async def bulk_audit(
    current_user: dict = Depends(get_current_user)
):
    """Audita los controles aplicables contra el repositorio documental mediante IA/RAG"""
    import asyncio
    from app.models.evidence_chunk import EvidenceChunk
    from app.services.embedding_service import EmbeddingService

    DEMO_LIMIT = 10  # Limitar para evitar timeout en Render.com (plan gratuito = 30s)
    embedder = EmbeddingService()
    results = []

    async with AsyncSessionLocal() as session:
        stmt = select(ISOCControl).where(ISOCControl.applies == True).limit(DEMO_LIMIT)
        result = await session.execute(stmt)
        controls = result.scalars().all()

        for control in controls:
            try:
                query_vector = embedder.generate_single_embedding(
                    f"{control.title}. {control.description}"
                )
                chunk_stmt = (
                    select(EvidenceChunk)
                    .order_by(EvidenceChunk.embedding.cosine_distance(query_vector))
                    .limit(4)
                )
                chunk_res = await session.execute(chunk_stmt)
                top_chunks = chunk_res.scalars().all()
                context = "\n\n".join([f"- {c.content}" for c in top_chunks]) if top_chunks else ""

                evaluation = await asyncio.wait_for(
                    analyzer.ai_service.mass_evaluate_control(
                        control_title=control.title,
                        control_desc=control.description,
                        context_chunks=context
                    ),
                    timeout=8.0
                )
            except (asyncio.TimeoutError, Exception):
                evaluation = {
                    "score": 0,
                    "status": "notImplemented",
                    "justification": "Evaluación no disponible en este momento."
                }

            control.score = evaluation.get("score", 0)
            control.justification = evaluation.get("justification", "")
            ai_status = evaluation.get("status", "notImplemented").lower()
            if "implemented" in ai_status:
                control.status = "Implementado"
            elif "planned" in ai_status:
                control.status = "Planificado"
            else:
                control.status = "No Implementado"

            results.append({
                "id": control.control_id,
                "status": control.status,
                "score": control.score,
                "justification": control.justification
            })

        await session.commit()

    return {
        "message": f"Auditoría Masiva completada. {len(results)} controles evaluados.",
        "results": results
    }

@router.get("/integrity")
async def get_compliance_integrity(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Detecta señales de compliance washing cruzando controles con evidencias."""
    from app.models.evidence import Evidence
    from sqlalchemy import func

    # Controles marcados como Implementado
    ctrl_result = await db.execute(
        select(ISOCControl).where(ISOCControl.status == "Implementado", ISOCControl.applies == True)
    )
    implemented = ctrl_result.scalars().all()

    # Todas las evidencias con su metadata
    ev_result = await db.execute(select(Evidence))
    evidences = ev_result.scalars().all()

    # Construir set de controles con evidencia
    controls_with_evidence = set()
    for ev in evidences:
        ctrl = (ev.evidence_metadata or {}).get("control", "")
        if ctrl:
            controls_with_evidence.add(ctrl.strip().upper())

    alerts = []
    controls_no_evidence = []

    for ctrl in implemented:
        cid = (ctrl.control_id or "").strip().upper()
        if cid not in controls_with_evidence:
            controls_no_evidence.append({
                "control_id": ctrl.control_id,
                "title": ctrl.title,
                "category": ctrl.category,
            })

    if controls_no_evidence:
        alerts.append({
            "id": "no-evidence",
            "severity": "high" if len(controls_no_evidence) > 5 else "medium",
            "title": f"{len(controls_no_evidence)} controles implementados sin evidencia",
            "description": f"Estos controles están marcados como 'Implementado' pero no tienen ninguna evidencia asociada en el Centro de Evidencias.",
            "controls": controls_no_evidence,
            "recommendation": "Sube evidencias para cada control o ajusta su estado a 'Planificado'."
        })

    # Score de integridad
    total_implemented = len(implemented)
    with_evidence = total_implemented - len(controls_no_evidence)
    integrity_score = round((with_evidence / total_implemented * 100) if total_implemented > 0 else 100)

    return {
        "integrity_score": integrity_score,
        "total_implemented": total_implemented,
        "with_evidence": with_evidence,
        "without_evidence": len(controls_no_evidence),
        "alerts": alerts
    }


@router.get("/soa/export")
async def export_soa_pdf(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Genera y descarga la Declaración de Aplicabilidad (SOA) como PDF"""
    import io
    import fitz
    from fastapi.responses import StreamingResponse

    result = await db.execute(select(ISOCControl).order_by(ISOCControl.control_id))
    controls = result.scalars().all()

    C_GREEN  = (0.063, 0.725, 0.506)
    C_DARK   = (0.086, 0.118, 0.157)
    C_GRAY   = (0.42, 0.45, 0.50)
    C_WHITE  = (1, 1, 1)
    C_LINE   = (0.88, 0.90, 0.92)
    C_AMBER  = (0.96, 0.62, 0.04)
    C_RED    = (0.93, 0.27, 0.27)
    C_PURPLE = (0.55, 0.36, 0.96)
    W, H = 842, 595  # A4 landscape

    doc = fitz.open()

    def new_page():
        p = doc.new_page(width=W, height=H)
        p.draw_rect(fitz.Rect(0, 0, W, 56), color=None, fill=C_DARK)
        p.insert_text((24, 22), "DANI ISO 27001", fontsize=12, color=C_WHITE, fontname="helv")
        p.insert_text((24, 40), "Declaracion de Aplicabilidad (SOA) - ISO/IEC 27001:2022 Anexo A", fontsize=8, color=(0.6, 0.7, 0.6), fontname="helv")
        fecha = datetime.utcnow().strftime("%d/%m/%Y")
        p.insert_text((W - 80, 36), fecha, fontsize=8, color=C_GRAY, fontname="helv")
        p.draw_rect(fitz.Rect(0, H - 22, W, H), color=None, fill=C_DARK)
        p.insert_text((24, H - 7), "Documento Confidencial - Generado automaticamente por DANI GRC Platform", fontsize=7, color=(0.5, 0.5, 0.5), fontname="helv")
        p.insert_text((W - 60, H - 7), f"Pag. {doc.page_count}", fontsize=7, color=(0.5, 0.5, 0.5), fontname="helv")
        return p

    # --- PORTADA ---
    page = new_page()
    applicable   = [c for c in controls if c.applies]
    implemented  = [c for c in applicable if c.status == "Implementado"]
    planned      = [c for c in applicable if c.status == "Planificado"]
    not_impl     = [c for c in applicable if c.status not in ("Implementado", "Planificado")]
    not_applicable = [c for c in controls if not c.applies]

    page.draw_rect(fitz.Rect(24, 80, W - 24, 82), color=None, fill=C_GREEN)
    page.insert_text((24, 110), "Declaracion de Aplicabilidad", fontsize=22, color=C_DARK, fontname="helv")
    page.insert_text((24, 138), "Statement of Applicability (SOA) | ISO/IEC 27001:2022", fontsize=11, color=C_GRAY, fontname="helv")
    page.draw_rect(fitz.Rect(24, 158), color=None, fill=C_LINE) if False else None

    stats = [
        ("Total controles Anexo A", str(len(controls)), C_DARK),
        ("Aplicables",              str(len(applicable)), C_GREEN),
        ("Implementados",           str(len(implemented)), C_GREEN),
        ("Planificados",            str(len(planned)), C_AMBER),
        ("No implementados",        str(len(not_impl)), C_RED),
        ("No aplicables",           str(len(not_applicable)), C_GRAY),
    ]
    x = 24
    for label, val, color in stats:
        page.draw_rect(fitz.Rect(x, 180, x + 120, 240), color=None, fill=(0.95, 0.97, 0.96))
        page.insert_text((x + 8, 212), val, fontsize=24, color=color, fontname="helv")
        page.insert_text((x + 8, 230), label, fontsize=7, color=C_GRAY, fontname="helv")
        x += 132

    page.insert_text((24, 275), f"Generado: {datetime.utcnow().strftime('%d de %B de %Y')}   |   Clasificacion: CONFIDENCIAL   |   Version: 1.0", fontsize=8, color=C_GRAY, fontname="helv")

    # --- TABLA DE CONTROLES (landscape, 6 columnas) ---
    COL = {"id": 24, "title": 85, "cat": 310, "applies": 420, "status": 490, "just": 560}
    HDR_H = 28
    ROW_H = 22
    TOP   = 68
    BOT   = H - 30

    page = new_page()
    y = TOP

    def draw_header(p, y):
        p.draw_rect(fitz.Rect(24, y, W - 24, y + HDR_H), color=None, fill=C_DARK)
        p.insert_text((COL["id"] + 4,    y + 18), "Control",       fontsize=8, color=C_WHITE, fontname="helv")
        p.insert_text((COL["title"] + 4, y + 18), "Titulo",         fontsize=8, color=C_WHITE, fontname="helv")
        p.insert_text((COL["cat"] + 4,   y + 18), "Categoria",      fontsize=8, color=C_WHITE, fontname="helv")
        p.insert_text((COL["applies"] + 4,y + 18),"Aplica",         fontsize=8, color=C_WHITE, fontname="helv")
        p.insert_text((COL["status"] + 4, y + 18), "Estado",        fontsize=8, color=C_WHITE, fontname="helv")
        p.insert_text((COL["just"] + 4,   y + 18), "Justificacion", fontsize=8, color=C_WHITE, fontname="helv")
        return y + HDR_H

    y = draw_header(page, y)

    for i, ctrl in enumerate(controls):
        if y + ROW_H > BOT:
            page = new_page()
            y = TOP
            y = draw_header(page, y)

        row_bg = (0.97, 0.99, 0.98) if i % 2 == 0 else C_WHITE
        page.draw_rect(fitz.Rect(24, y, W - 24, y + ROW_H), color=None, fill=row_bg)

        # Control ID en morado
        page.insert_text((COL["id"] + 4, y + 14), ctrl.control_id or "", fontsize=7, color=C_PURPLE, fontname="helv")

        # Título (truncar)
        title_txt = (ctrl.title or "")[:42]
        page.insert_text((COL["title"] + 4, y + 14), title_txt, fontsize=7, color=C_DARK, fontname="helv")

        # Categoría
        cat_txt = (ctrl.category or "")[:18]
        page.insert_text((COL["cat"] + 4, y + 14), cat_txt, fontsize=7, color=C_GRAY, fontname="helv")

        # Aplica (badge)
        if ctrl.applies:
            page.draw_rect(fitz.Rect(COL["applies"] + 4, y + 4, COL["applies"] + 54, y + ROW_H - 4), color=None, fill=C_GREEN)
            page.insert_text((COL["applies"] + 8, y + 14), "SI", fontsize=7, color=C_WHITE, fontname="helv")
        else:
            page.draw_rect(fitz.Rect(COL["applies"] + 4, y + 4, COL["applies"] + 54, y + ROW_H - 4), color=None, fill=C_GRAY)
            page.insert_text((COL["applies"] + 8, y + 14), "NO", fontsize=7, color=C_WHITE, fontname="helv")

        # Estado (badge de color)
        if ctrl.applies:
            s = ctrl.status or "No Implementado"
            sc = C_GREEN if s == "Implementado" else (C_AMBER if s == "Planificado" else C_RED)
            st = s[:14]
            page.draw_rect(fitz.Rect(COL["status"] + 4, y + 4, COL["status"] + 80, y + ROW_H - 4), color=None, fill=sc)
            page.insert_text((COL["status"] + 8, y + 14), st, fontsize=6, color=C_WHITE, fontname="helv")

        # Justificación
        just = (ctrl.justification or ("Incluido en alcance SGSI" if ctrl.applies else "Fuera de alcance"))[:28]
        page.insert_text((COL["just"] + 4, y + 14), just, fontsize=6, color=C_GRAY, fontname="helv")

        # Línea separadora
        page.draw_rect(fitz.Rect(24, y + ROW_H, W - 24, y + ROW_H + 0.5), color=None, fill=C_LINE)
        y += ROW_H

    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=SOA_ISO27001_DANI.pdf"}
    )
