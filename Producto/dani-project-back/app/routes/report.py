from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.services.gap_analyzer import GapAnalyzer
from app.services.deepseek_service import DeepSeekService
from app.config import settings
from app.models.capa import CAPA, CAPAStatus
from app.models.risk import Risk
from app.models.evidence import Evidence

router = APIRouter(prefix="/api/reports", tags=["Reports"])


async def _ai_call(client, model: str, system: str, user: str, max_tokens: int = 700) -> str:
    resp = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.4,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content.strip()


@router.get("/executive")
async def generate_executive_report(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Informe ejecutivo técnico: datos reales + análisis narrativo por IA."""

    # ── 1. Gap Analysis ────────────────────────────────────────────────────
    analyzer = GapAnalyzer(db)
    try:
        gap_data = await analyzer.generate_complete_gap_analysis()
        clause_gaps   = gap_data.get("clause_gaps", [])
        overall_score = gap_data.get("overall_score", {})
        remediation   = gap_data.get("remediation_plan", {})
        control_gaps  = gap_data.get("control_gaps", {})
    except Exception:
        clause_gaps = []
        overall_score = {"overall_score": 0, "control_score": 0, "clause_score": 0}
        remediation = {}
        control_gaps = {}

    # ── 2. Riesgos ─────────────────────────────────────────────────────────
    all_risks  = (await db.execute(select(Risk))).scalars().all()
    open_risks = [r for r in all_risks if getattr(r, "status", "") not in ("mitigated", "accepted", "closed")]
    critical   = [r for r in open_risks if getattr(r, "level", "") in ("critical", "crítico")]
    high       = [r for r in open_risks if getattr(r, "level", "") in ("high", "alto")]

    risk_summary = {
        "total": len(all_risks),
        "open":  len(open_risks),
        "critical": len(critical),
        "high":  len(high),
        "medium": len([r for r in open_risks if getattr(r, "level", "") in ("medium", "medio")]),
        "low":   len([r for r in open_risks if getattr(r, "level", "") in ("low", "bajo")]),
        "top_risks": [
            {
                "title": getattr(r, "title", ""),
                "level": getattr(r, "level", ""),
                "category": getattr(r, "category", ""),
                "description": (getattr(r, "description", "") or "")[:120],
            }
            for r in (critical + high)[:5]
        ],
    }

    # ── 3. CAPAs ───────────────────────────────────────────────────────────
    all_capas = (await db.execute(select(CAPA))).scalars().all()

    def _capa_status(c):
        return c.status.value if hasattr(c.status, "value") else str(c.status)

    def _capa_priority(c):
        return c.priority.value if hasattr(c.priority, "value") else str(c.priority)

    capa_summary = {
        "total":       len(all_capas),
        "open":        len([c for c in all_capas if _capa_status(c) == "open"]),
        "in_progress": len([c for c in all_capas if _capa_status(c) == "inProgress"]),
        "resolved":    len([c for c in all_capas if _capa_status(c) == "resolved"]),
        "closed":      len([c for c in all_capas if _capa_status(c) == "closed"]),
        "list": [
            {
                "nc_code":   c.nc_code,
                "title":     c.title,
                "priority":  _capa_priority(c),
                "status":    _capa_status(c),
                "assignee":  c.assignee,
                "progress":  c.progress,
                "due_date":  c.due_date.isoformat() if c.due_date else None,
                "root_cause": (c.root_cause or "")[:100],
                "corrective_action": (c.corrective_action or "")[:100],
            }
            for c in all_capas
        ],
    }

    # ── 4. Evidencias ──────────────────────────────────────────────────────
    all_ev = (await db.execute(select(Evidence))).scalars().all()
    now    = datetime.utcnow()
    expired = [e for e in all_ev if e.expiry_date and e.expiry_date < now]
    expiring = [e for e in all_ev if e.expiry_date and 0 <= (e.expiry_date - now).days <= 30]

    evidence_summary = {
        "total":         len(all_ev),
        "expired":       len(expired),
        "expiring_soon": len(expiring),
        "valid":         len(all_ev) - len(expired),
    }

    # ── 5. Métricas derivadas ──────────────────────────────────────────────
    score_val  = overall_score.get("overall_score", 0)
    impl_total = control_gaps.get("implemented_controls", 0)
    tot_ctrl   = control_gaps.get("total_controls", 114)
    ctrl_by_cat = control_gaps.get("by_category", {})

    readiness = (
        "LISTO PARA CERTIFICACIÓN"            if score_val >= 85 else
        "CASI LISTO (ajustes menores)"        if score_val >= 70 else
        "EN PROGRESO (brechas significativas)" if score_val >= 50 else
        "ETAPA INICIAL (brechas críticas)"
    )

    # ── 6. Contexto IA ─────────────────────────────────────────────────────
    clause_text = "\n".join(
        f"  • Cláusula {c['clause_id']} – {c['clause_name']}: {c['current_score']:.0f}% "
        f"(brecha: {c['gap']:.0f} pts, prioridad: {c['priority']})"
        for c in clause_gaps
    )
    top_risk_text = "\n".join(
        f"  • [{r['level'].upper()}] {r['title']} – {r['description']}"
        for r in risk_summary["top_risks"]
    ) or "  Sin riesgos críticos/altos registrados."
    open_capa_text = "\n".join(
        f"  • {c['nc_code']} | {c['title']} | Prioridad: {c['priority']} | "
        f"Progreso: {c['progress']}% | Asignado: {c['assignee'] or 'Sin asignar'}"
        for c in capa_summary["list"] if c["status"] in ("open", "inProgress")
    ) or "  Sin no conformidades abiertas."

    ai_context = (
        f"ÍNDICE DE SALUD ISO 27001: {score_val:.1f}% — Estado: {readiness}\n"
        f"Controles implementados: {impl_total} de {tot_ctrl} ({impl_total/max(tot_ctrl,1)*100:.1f}%)\n"
        f"Score cláusulas: {overall_score.get('clause_score',0):.1f}% | "
        f"Score controles: {overall_score.get('control_score',0):.1f}%\n\n"
        f"ANÁLISIS POR CLÁUSULA:\n{clause_text}\n\n"
        f"RIESGOS: Total {risk_summary['total']} | Abiertos {risk_summary['open']} "
        f"(Críticos {risk_summary['critical']}, Altos {risk_summary['high']}, "
        f"Medios {risk_summary['medium']}, Bajos {risk_summary['low']})\n"
        f"Riesgos prioritarios:\n{top_risk_text}\n\n"
        f"CAPAs: Total {capa_summary['total']} | Abiertas {capa_summary['open']} | "
        f"En progreso {capa_summary['in_progress']} | Resueltas {capa_summary['resolved']} | "
        f"Cerradas {capa_summary['closed']}\n"
        f"CAPAs activas:\n{open_capa_text}\n\n"
        f"EVIDENCIAS: Total {evidence_summary['total']} | Vencidas {evidence_summary['expired']} | "
        f"Por vencer {evidence_summary['expiring_soon']} | Válidas {evidence_summary['valid']}\n\n"
        f"CONTROLES POR CATEGORÍA:\n"
        f"  Organizacionales: {ctrl_by_cat.get('organizational',{}).get('implemented',0)}/{ctrl_by_cat.get('organizational',{}).get('total',0)}\n"
        f"  Personas: {ctrl_by_cat.get('people',{}).get('implemented',0)}/{ctrl_by_cat.get('people',{}).get('total',0)}\n"
        f"  Físicos: {ctrl_by_cat.get('physical',{}).get('implemented',0)}/{ctrl_by_cat.get('physical',{}).get('total',0)}\n"
        f"  Tecnológicos: {ctrl_by_cat.get('technological',{}).get('implemented',0)}/{ctrl_by_cat.get('technological',{}).get('total',0)}"
    )

    # ── 7. Llamadas IA ─────────────────────────────────────────────────────
    ai_svc   = DeepSeekService()
    ai_model = settings.AI_MODEL
    sys_p    = (
        "Eres un auditor líder certificado ISO 27001:2022 y experto en ciberseguridad corporativa. "
        "Redactas informes técnicos formales para defensas de proyectos de titulación. "
        "Tu lenguaje es preciso, técnico y formal. Sin emojis. Usa terminología ISO 27001:2022 exacta."
    )

    try:
        executive_summary = await _ai_call(
            ai_svc.client, ai_model, sys_p,
            f"Datos reales del SGSI:\n{ai_context}\n\n"
            "Redacta un RESUMEN EJECUTIVO formal de 3 párrafos (máx. 250 palabras) para un informe de "
            "auditoría interna ISO 27001. Incluye: estado actual del SGSI, principales hallazgos y nivel "
            "de madurez. Solo prosa técnica formal, sin viñetas.",
            max_tokens=600,
        )
    except Exception:
        executive_summary = _fallback_executive(score_val, readiness, risk_summary, capa_summary)

    try:
        technical_analysis = await _ai_call(
            ai_svc.client, ai_model, sys_p,
            f"Datos reales del SGSI:\n{ai_context}\n\n"
            "Redacta un ANÁLISIS TÉCNICO DE BRECHAS de 3 párrafos (máx. 300 palabras). Analiza las "
            "cláusulas con mayor brecha, los controles críticos pendientes del Anexo A y el impacto de "
            "los riesgos no mitigados. Solo prosa técnica formal con referencias a cláusulas ISO 27001:2022.",
            max_tokens=700,
        )
    except Exception:
        technical_analysis = _fallback_technical(clause_gaps, risk_summary)

    try:
        recommendations_raw = await _ai_call(
            ai_svc.client, ai_model, sys_p,
            f"Datos reales del SGSI:\n{ai_context}\n\n"
            "Genera exactamente 5 RECOMENDACIONES TÉCNICAS PRIORITARIAS con este formato:\n"
            "RECOMENDACION_N: [título]\nCONTROL: [ref. Anexo A o cláusula]\n"
            "DESCRIPCION: [2 oraciones técnicas]\nPLAZO: [Inmediato/30 días/60 días/90 días]\n"
            "IMPACTO: [Alto/Medio/Bajo]\n\n"
            "Ordena por urgencia. Sé específico con controles del Anexo A 2022.",
            max_tokens=900,
        )
    except Exception:
        recommendations_raw = _fallback_recommendations()

    # ── 8. Respuesta ───────────────────────────────────────────────────────
    return {
        "generated_at":    datetime.utcnow().isoformat(),
        "generated_by":    current_user.get("full_name") or current_user.get("email"),
        "ai_model":        ai_model,
        "executive_summary":   executive_summary,
        "technical_analysis":  technical_analysis,
        "recommendations_raw": recommendations_raw,
        "data": {
            "overall_score":   overall_score,
            "clause_gaps":     clause_gaps,
            "risk_summary":    risk_summary,
            "capa_summary":    capa_summary,
            "evidence_summary": evidence_summary,
            "control_gaps":    control_gaps,
            "remediation_plan": remediation,
        },
    }


# ── Fallbacks sin IA ──────────────────────────────────────────────────────

def _fallback_executive(score: float, readiness: str, risk: dict, capa: dict) -> str:
    return (
        f"El Sistema de Gestión de Seguridad de la Información (SGSI) de la organización presenta un índice "
        f"de cumplimiento del {score:.1f}% respecto a los requisitos de la norma ISO/IEC 27001:2022, situándolo "
        f"en estado '{readiness}'. Este resultado refleja avances en la implementación de controles del Anexo A, "
        f"aunque persisten brechas en cláusulas clave que requieren atención prioritaria antes del proceso formal "
        f"de certificación.\n\n"
        f"El análisis del mapa de riesgos identifica {risk['open']} riesgos activos, de los cuales "
        f"{risk['critical']} son de nivel crítico y {risk['high']} de nivel alto, constituyendo vectores de "
        f"amenaza inmediata para la confidencialidad, integridad y disponibilidad de los activos de información. "
        f"La organización registra {capa['total']} no conformidades, con {capa['open'] + capa['in_progress']} "
        f"en proceso activo de remediación.\n\n"
        f"Se recomienda priorizar la implementación de controles críticos del Anexo A relacionados con gestión "
        f"de accesos (A.5.15, A.5.16), respuesta a incidentes (A.5.24) y gestión de vulnerabilidades (A.8.8), "
        f"con el objetivo de alcanzar el umbral mínimo del 85% requerido para iniciar el proceso de certificación."
    )


def _fallback_technical(clause_gaps: list, risk: dict) -> str:
    critical = [c for c in clause_gaps if c.get("gap", 0) > 30]
    names = ", ".join(f"Cláusula {c['clause_id']} ({c['clause_name']})" for c in critical[:3])
    return (
        f"El análisis de brechas por cláusula revela deficiencias significativas en {names or 'múltiples cláusulas'}, "
        f"áreas que requieren intervención técnica inmediata. La madurez de los procesos de soporte (Cláusula 7) "
        f"y operación (Cláusula 8) es insuficiente para soportar una auditoría de certificación, evidenciándose "
        f"ausencia de controles formalizados en gestión de activos de información y continuidad del negocio.\n\n"
        f"Desde la perspectiva del Anexo A de la ISO 27001:2022, los dominios tecnológico (Sección 8) y "
        f"organizacional (Sección 5) presentan los porcentajes de implementación más bajos. Los controles "
        f"de autenticación multifactor (A.8.5), cifrado (A.8.24), monitoreo (A.8.16) y gestión de "
        f"vulnerabilidades (A.8.8) no están operativos, incrementando la superficie de ataque.\n\n"
        f"Con {risk['critical']} amenazas críticas y {risk['high']} altas sin mitigar, el riesgo residual "
        f"es inaceptable bajo el marco ISO 27001. La ausencia de un ciclo formal de tratamiento de riesgos "
        f"(Cláusula 6.1.2) impide la trazabilidad de decisiones requerida por auditores externos."
    )


def _fallback_recommendations() -> str:
    recs = [
        ("Implementar Autenticación Multifactor", "A.8.5 – Autenticación segura",
         "Desplegar MFA obligatorio para todos los accesos a sistemas críticos y remotos. "
         "Configurar políticas de contraseñas mediante GPO o equivalente cloud.", "Inmediato", "Alto"),
        ("Plan Formal de Respuesta a Incidentes", "A.5.24 – Gestión de incidentes de seguridad",
         "Documentar y probar un procedimiento de respuesta que cubra detección, contención y recuperación. "
         "Designar un equipo CSIRT con roles y responsabilidades definidos.", "30 días", "Alto"),
        ("Escáner de Vulnerabilidades Continuo", "A.8.8 – Gestión de vulnerabilidades técnicas",
         "Implementar escaneo semanal sobre infraestructura crítica con SLA de remediación por criticidad. "
         "Integrar resultados al proceso de gestión de riesgos.", "30 días", "Alto"),
        ("Política de Clasificación de Información", "A.5.12 – Clasificación de la información",
         "Definir esquema de clasificación (Pública, Interna, Confidencial, Secreta) con controles asociados. "
         "Capacitar a todos los empleados en etiquetado y manejo.", "60 días", "Medio"),
        ("Revisiones Periódicas de Acceso", "A.5.18 – Derechos de acceso",
         "Establecer proceso trimestral de recertificación de derechos sobre sistemas críticos. "
         "Automatizar revocación de acceso en máximo 24 horas tras baja de personal.", "60 días", "Medio"),
    ]
    lines = []
    for i, (title, control, desc, plazo, impacto) in enumerate(recs, 1):
        lines.append(
            f"RECOMENDACION_{i}: {title}\n"
            f"CONTROL: {control}\n"
            f"DESCRIPCION: {desc}\n"
            f"PLAZO: {plazo}\n"
            f"IMPACTO: {impacto}"
        )
    return "\n\n".join(lines)
