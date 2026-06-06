# app/services/gap_analyzer.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime, timedelta
import json

from app.models.gap_analysis import GapAnalysis, RemediationAction, ControlImplementation, KPI, PriorityLevel, GapStatus
from app.models.iso_controls import ISOCControl
from app.services.iso_compliance_analyzer import ISOComplianceAnalyzer

class GapAnalyzer:
    """Analizador de brechas ISO 27001"""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.iso_analyzer = ISOComplianceAnalyzer()
    
    async def generate_complete_gap_analysis(self) -> Dict[str, Any]:
        """Generar análisis de brecha completo"""
        
        # 1. Análisis por cláusula
        clause_gaps = await self._analyze_clauses()
        
        # 2. Análisis de controles
        control_gaps = await self._analyze_controls()
        
        # 3. Matriz de madurez
        maturity_matrix = await self._calculate_maturity()
        
        # 4. Plan de remediación
        remediation_plan = await self._create_remediation_plan()
        
        # 5. Dashboard de KPIs
        kpi_dashboard = await self._generate_kpi_dashboard()
        
        # 6. Score general
        overall_score = await self._calculate_overall_score()
        
        return {
            "clause_gaps": clause_gaps,
            "control_gaps": control_gaps,
            "maturity_matrix": maturity_matrix,
            "remediation_plan": remediation_plan,
            "kpi_dashboard": kpi_dashboard,
            "overall_score": overall_score,
            "certification_readiness": self._get_readiness_level(overall_score),
            "estimated_certification_date": self._estimate_date(overall_score)
        }
    
    async def _analyze_clauses(self) -> List[Dict]:
        """Analizar brechas por cláusula"""
        clauses = [
            {"id": "4", "name": "Contexto", "weight": 0.05, "requirements": ["4.1", "4.2", "4.3", "4.4"]},
            {"id": "5", "name": "Liderazgo", "weight": 0.10, "requirements": ["5.1", "5.2", "5.3"]},
            {"id": "6", "name": "Planificación", "weight": 0.15, "requirements": ["6.1", "6.2"]},
            {"id": "7", "name": "Soporte", "weight": 0.15, "requirements": ["7.1", "7.2", "7.3", "7.4", "7.5"]},
            {"id": "8", "name": "Operación", "weight": 0.25, "requirements": ["8.1", "8.2", "8.3"]},
            {"id": "9", "name": "Evaluación", "weight": 0.15, "requirements": ["9.1", "9.2", "9.3"]},
            {"id": "10", "name": "Mejora", "weight": 0.15, "requirements": ["10.1", "10.2"]}
        ]
        
        results = []
        for clause in clauses:
            # Evaluar cada cláusula (simplificado)
            current_score = await self._evaluate_clause(clause["id"])
            target_score = 100
            gap = target_score - current_score
            
            results.append({
                "clause_id": clause["id"],
                "clause_name": clause["name"],
                "current_score": current_score,
                "target_score": target_score,
                "gap": gap,
                "weight": clause["weight"],
                "priority": self._get_priority(gap),
                "requirements": clause["requirements"]
            })
        
        return results
    
    async def _evaluate_clause(self, clause_id: str) -> float:
        """Evaluar una cláusula específica"""
        # Mapeo de scores por cláusula (desde el gap analysis manual)
        clause_scores = {
            "4": 80,
            "5": 70,
            "6": 60,
            "7": 75,
            "8": 55,
            "9": 50,
            "10": 45
        }
        return clause_scores.get(clause_id, 50)
    
    async def _analyze_controls(self) -> Dict:
        """Analizar brechas de controles"""
        # Obtener todos los controles ISO
        controls_data = self.iso_analyzer.get_all_controls()
        controls = controls_data.get("controls", [])
        
        # Mapeo de prioridades
        high_priority = ["5.1", "5.15", "5.16", "8.7", "8.8", "8.13", "5.24"]
        medium_priority = ["5.2", "5.3", "6.3", "8.1", "8.2", "8.15", "8.20"]
        
        results = {
            "by_priority": {
                "critical": [],
                "high": [],
                "medium": [],
                "low": []
            },
            "by_category": {
                "organizational": {"total": 0, "implemented": 0, "percentage": 0},
                "people": {"total": 0, "implemented": 0, "percentage": 0},
                "physical": {"total": 0, "implemented": 0, "percentage": 0},
                "technological": {"total": 0, "implemented": 0, "percentage": 0}
            },
            "total_controls": len(controls),
            "implemented_controls": 3,  # Desde el gap analysis
            "partial_controls": 90,
            "pending_controls": 0
        }
        
        for control in controls:
            cat = control["category"]
            results["by_category"][cat]["total"] += 1
            
            # Contar implementados
            if control["id"] in high_priority:
                results["by_priority"]["critical"].append(control["id"])
            elif control["id"] in medium_priority:
                results["by_priority"]["high"].append(control["id"])
            else:
                results["by_priority"]["medium"].append(control["id"])
        
        # Calcular porcentajes
        for cat in results["by_category"]:
            implemented = 3 if cat == "organizational" else 0
            results["by_category"][cat]["implemented"] = implemented
            results["by_category"][cat]["percentage"] = round((implemented / results["by_category"][cat]["total"]) * 100, 1)
        
        return results
    
    async def _calculate_maturity(self) -> Dict:
        """Calcular matriz de madurez"""
        areas = {
            "Liderazgo": {"current": 2, "target": 4},
            "Gestión de Riesgos": {"current": 3, "target": 5},
            "Controles": {"current": 1, "target": 3},
            "Monitoreo": {"current": 2, "target": 4},
            "Mejora Continua": {"current": 1, "target": 4},
            "Cultura Seguridad": {"current": 2, "target": 4},
            "Documentación": {"current": 2, "target": 3},
            "Auditoría": {"current": 1, "target": 3}
        }
        
        total_current = sum(area["current"] for area in areas.values()) / len(areas)
        total_target = sum(area["target"] for area in areas.values()) / len(areas)
        
        return {
            "areas": areas,
            "overall_current": round(total_current, 1),
            "overall_target": round(total_target, 1),
            "gap": round(total_target - total_current, 1),
            "level_description": self._get_maturity_level_description(total_current)
        }
    
    async def _create_remediation_plan(self) -> Dict:
        """Crear plan de remediación"""
        # Controles P0 (prioridad crítica)
        p0_controls = [
            {"id": "5.15", "title": "Control de acceso - MFA", "hours": 40, "responsible": "Security"},
            {"id": "5.16", "title": "Gestión de identidades", "hours": 30, "responsible": "DevOps"},
            {"id": "8.8", "title": "Escáner vulnerabilidades", "hours": 20, "responsible": "Security"},
            {"id": "8.13", "title": "Copia seguridad 100%", "hours": 20, "responsible": "IT"},
            {"id": "5.24", "title": "Plan de incidentes", "hours": 25, "responsible": "CISO"}
        ]
        
        # Controles P1 (prioridad alta)
        p1_controls = [
            {"id": "5.2", "title": "Roles y responsabilidades", "hours": 15, "responsible": "HR"},
            {"id": "5.12", "title": "Clasificación información", "hours": 20, "responsible": "CISO"},
            {"id": "8.15", "title": "Registro centralizado", "hours": 30, "responsible": "DevOps"}
        ]
        
        return {
            "sprint_1": {
                "duration_days": 15,
                "controls": p0_controls,
                "total_hours": sum(c["hours"] for c in p0_controls),
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=15)).isoformat()
            },
            "sprint_2": {
                "duration_days": 30,
                "controls": p1_controls,
                "total_hours": sum(c["hours"] for c in p1_controls),
                "start_date": (datetime.utcnow() + timedelta(days=15)).isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=45)).isoformat()
            },
            "estimated_completion": (datetime.utcnow() + timedelta(days=90)).isoformat(),
            "estimated_cost_usd": 16350,
            "total_hours": 200
        }
    
    async def _generate_kpi_dashboard(self) -> Dict:
        """Generar dashboard de KPIs"""
        result = await self.db.execute(select(KPI))
        kpis = result.scalars().all()

        if not kpis:
            default_kpis = self._get_default_kpis()
            for kpi_data in default_kpis:
                self.db.add(KPI(**kpi_data))
            await self.db.commit()
            kpis = default_kpis  # dicts, compatibles con _format_kpis

        return self._format_kpis(kpis)
    
    async def _calculate_overall_score(self) -> Dict:
        """Calcular score general de cumplimiento"""
        clause_scores = await self._analyze_clauses()
        weighted_sum = sum(c["current_score"] * c["weight"] for c in clause_scores)
        
        control_analysis = await self._analyze_controls()
        control_score = (control_analysis["implemented_controls"] / control_analysis["total_controls"]) * 100
        
        # Score general
        overall = (weighted_sum + control_score) / 2
        
        return {
            "overall_score": round(overall, 1),
            "clause_score": weighted_sum,
            "control_score": control_score,
            "required_for_certification": 85,
            "gap_to_certification": round(85 - overall, 1),
            "trend": "up" if overall > 50 else "down"
        }
    
    def _get_priority(self, gap: float) -> str:
        if gap > 30:
            return "critical"
        elif gap > 15:
            return "high"
        elif gap > 5:
            return "medium"
        return "low"
    
    def _get_readiness_level(self, score: Dict) -> str:
        if score["overall_score"] >= 85:
            return "ready"
        elif score["overall_score"] >= 70:
            return "almost_ready"
        elif score["overall_score"] >= 50:
            return "in_progress"
        return "not_ready"
    
    def _estimate_date(self, score: Dict) -> str:
        current = score["overall_score"]
        target = 85
        gap = target - current
        months_needed = max(1, gap / 10)  # Aprox 10% por mes
        return (datetime.utcnow() + timedelta(days=int(months_needed * 30))).isoformat()
    
    def _get_maturity_level_description(self, level: float) -> str:
        if level < 1.5:
            return "Inicial - Procesos impredecibles"
        elif level < 2.5:
            return "Repetible - Procesos básicos documentados"
        elif level < 3.5:
            return "Definido - Procesos estandarizados"
        elif level < 4.5:
            return "Gestionado - Procesos medidos y controlados"
        return "Optimizado - Mejora continua"
    
    def _get_default_kpis(self) -> List[Dict]:
        return [
            {"name": "Nivel cumplimiento ISO", "category": "strategic", "target_value": 85, "current_value": 59, "unit": "%", "frequency": "monthly"},
            {"name": "Riesgos críticos", "category": "strategic", "target_value": 0, "current_value": 2, "unit": "count", "frequency": "weekly"},
            {"name": "Usuarios con MFA", "category": "security", "target_value": 100, "current_value": 0, "unit": "%", "frequency": "weekly"},
            {"name": "Vulnerabilidades críticas", "category": "security", "target_value": 0, "current_value": 2, "unit": "count", "frequency": "weekly"},
            {"name": "Backup exitoso", "category": "operational", "target_value": 100, "current_value": 100, "unit": "%", "frequency": "daily"},
            {"name": "Disponibilidad", "category": "operational", "target_value": 99.9, "current_value": 99.95, "unit": "%", "frequency": "daily"},
        ]
    
    def _get_kpi_category(self, kpi) -> str:
        """Obtiene la categoría de un KPI sea dict u objeto ORM."""
        if isinstance(kpi, dict):
            return kpi.get("category", "")
        return getattr(kpi, "category", "")

    def _format_kpis(self, kpis: List) -> Dict:
        return {
            "strategic": [k for k in kpis if self._get_kpi_category(k) == "strategic"],
            "operational": [k for k in kpis if self._get_kpi_category(k) == "operational"],
            "security": [k for k in kpis if self._get_kpi_category(k) == "security"],
            "timestamp": datetime.utcnow().isoformat()
        }