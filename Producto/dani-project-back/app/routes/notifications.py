from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.evidence import Evidence
from app.models.document import Document, DocumentStatus
from app.models.capa import CAPA, CAPAStatus

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifications = []
    now = datetime.utcnow()

    # Evidencias expiradas o por vencer
    ev_result = await db.execute(select(Evidence))
    for ev in ev_result.scalars().all():
        validity = (ev.evidence_metadata or {}).get("validityDays", 30)
        if not ev.verified_at:
            continue
        expiry = ev.verified_at + timedelta(days=validity)
        days_left = (expiry - now).days
        if days_left < 0:
            notifications.append({
                "id": f"ev-exp-{ev.id}",
                "type": "error",
                "title": "Evidencia expirada",
                "message": f"{ev.title} — venció hace {abs(days_left)} día(s)",
                "time": ev.verified_at.strftime("%d/%m/%Y"),
                "read": False
            })
        elif days_left <= 7:
            notifications.append({
                "id": f"ev-warn-{ev.id}",
                "type": "warning",
                "title": "Evidencia por vencer",
                "message": f"{ev.title} — vence en {days_left} día(s)",
                "time": ev.verified_at.strftime("%d/%m/%Y"),
                "read": False
            })

    # Documentos pendientes de aprobación
    doc_result = await db.execute(
        select(Document).where(Document.status == DocumentStatus.DRAFT)
    )
    for doc in doc_result.scalars().all():
        notifications.append({
            "id": f"doc-{doc.id}",
            "type": "info",
            "title": "Documento pendiente de aprobación",
            "message": f"{doc.title} — en borrador",
            "time": doc.updated_at.strftime("%d/%m/%Y") if doc.updated_at else "—",
            "read": False
        })

    # NCs vencidas
    capa_result = await db.execute(
        select(CAPA).where(CAPA.status.in_([CAPAStatus.OPEN, CAPAStatus.IN_PROGRESS]))
    )
    for capa in capa_result.scalars().all():
        if capa.due_date and capa.due_date < now:
            days_overdue = (now - capa.due_date).days
            notifications.append({
                "id": f"capa-{capa.id}",
                "type": "error",
                "title": "No conformidad vencida",
                "message": f"{capa.nc_code}: {capa.title} — vencida hace {days_overdue} día(s)",
                "time": capa.due_date.strftime("%d/%m/%Y"),
                "read": False
            })

    # Ordenar: errores primero, luego warnings, luego info
    priority = {"error": 0, "warning": 1, "info": 2}
    notifications.sort(key=lambda n: priority.get(n["type"], 3))

    return {
        "notifications": notifications,
        "unread_count": sum(1 for n in notifications if not n["read"])
    }
