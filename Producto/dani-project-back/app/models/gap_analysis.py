# app/models/gap_analysis.py
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.dependencies.database import Base, TimestampMixin

class GapStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class PriorityLevel(str, enum.Enum):
    CRITICAL = "critical"  # P0
    HIGH = "high"          # P1
    MEDIUM = "medium"      # P2
    LOW = "low"            # P3

class GapAnalysis(Base, TimestampMixin):
    """Modelo para análisis de brechas"""
    __tablename__ = "gap_analysis"

    # FKs requeridas por la diapositiva de arquitectura
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    control_id = Column(String(50), nullable=True, index=True)  # Ej: "A.5.1" — referencia lógica a iso_controls.control_id

    clause_id = Column(String(20), nullable=False)  # 4,5,6,7,8,9,10
    clause_name = Column(String(200), nullable=False)
    requirement = Column(Text, nullable=False)
    current_status = Column(String(500))
    target_status = Column(String(500))
    gap_description = Column(Text)
    priority = Column(String(20), default=PriorityLevel.MEDIUM)
    status = Column(String(20), default=GapStatus.PENDING)
    responsible = Column(String(100))
    target_date = Column(DateTime)
    completed_date = Column(DateTime)
    notes = Column(Text)

    # Campos AI requeridos por la diapositiva
    score = Column(Float, nullable=True)           # Score 0-100 asignado por IA
    ai_response = Column(Text, nullable=True)      # Respuesta textual del LLM
    evidence_text = Column(Text, nullable=True)    # Texto de evidencia adjunta al gap

    # Relaciones
    user = relationship("User", foreign_keys=[user_id])
    actions = relationship("RemediationAction", back_populates="gap")

class RemediationAction(Base, TimestampMixin):
    """Acciones de remediación"""
    __tablename__ = "remediation_actions"
    
    gap_id = Column(String(36), ForeignKey("gap_analysis.id"))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    priority = Column(String(20), default=PriorityLevel.MEDIUM)
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer, default=0)
    status = Column(String(20), default=GapStatus.PENDING)
    assigned_to = Column(String(100))
    start_date = Column(DateTime)
    due_date = Column(DateTime)
    completed_date = Column(DateTime)
    dependencies = Column(JSON, default=[])  # Lista de action_ids
    deliverables = Column(JSON, default=[])  # Lista de entregables
    evidence_url = Column(String(500))
    
    # Relaciones
    gap = relationship("GapAnalysis", back_populates="actions")

class ControlImplementation(Base, TimestampMixin):
    """Estado de implementación de controles ISO"""
    __tablename__ = "control_implementation"
    
    control_id = Column(String(20), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    category = Column(String(50))  # organizational, people, physical, technological
    priority = Column(String(20), default=PriorityLevel.MEDIUM)
    implementation_status = Column(String(20), default="not_started")
    completion_percentage = Column(Integer, default=0)
    responsible = Column(String(100))
    target_date = Column(DateTime)
    completed_date = Column(DateTime)
    evidence_required = Column(JSON, default=[])
    notes = Column(Text)
    
    # KPIs específicos
    kpi_metric = Column(String(200))
    kpi_target = Column(Float)
    kpi_current = Column(Float)

class KPI(Base, TimestampMixin):
    """Métricas de desempeño"""
    __tablename__ = "kpi"
    
    name = Column(String(200), nullable=False)
    category = Column(String(50))  # strategic, operational, security
    formula = Column(String(500))
    target_value = Column(Float)
    current_value = Column(Float, default=0)
    unit = Column(String(50))
    frequency = Column(String(20))  # daily, weekly, monthly, quarterly
    trend = Column(String(20))  # up, down, stable
    status = Column(String(20))  # on_track, at_risk, behind
    last_updated = Column(DateTime, default=datetime.utcnow)