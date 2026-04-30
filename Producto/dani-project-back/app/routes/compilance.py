# app/routes/compliance.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime

from app.services.iso_analyzer import ISOComplianceAnalyzer
from app.services.iso_parser import ISOParser
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])

@router.get("/controls")
async def get_iso_controls():
    """Obtener todos los controles ISO 27001:2022"""
    parser = ISOParser()
    standard = parser.parse_standard()
    
    return {
        "standard": "ISO/IEC 27001:2022",
        "total_controls": len(standard["controls"]),
        "controls_by_category": {
            "organizational": len([c for c in standard["controls"] if c["category"] == "organizational"]),
            "people": len([c for c in standard["controls"] if c["category"] == "people"]),
            "physical": len([c for c in standard["controls"] if c["category"] == "physical"]),
            "technological": len([c for c in standard["controls"] if c["category"] == "technological"])
        },
        "controls": standard["controls"],
        "requirements": standard["requirements"]
    }

@router.post("/analyze")
async def analyze_compliance(
    organization_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Analizar cumplimiento de la organización con ISO 27001"""
    analyzer = ISOComplianceAnalyzer()
    
    # Datos de ejemplo (en producción vendrían de la BD)
    if not organization_data:
        organization_data = {
            "has_security_policy": True,
            "policy_reviewed": True,
            "policy_communicated": True,
            "has_identity_management": True,
            "has_multi_factor_auth": False,
            "has_regular_access_reviews": True,
            "has_antivirus": True,
            "antivirus_updated": True,
            "has_centralized_management": True,
            "has_backup_policy": True,
            "has_regular_backups": True,
            "has_restore_tested": False,
            "has_security_training": True,
            "training_periodic": True,
            "has_phishing_simulation": False,
            # Controles adicionales
            "control_5.2": True,
            "control_5.3": False,
            "control_5.4": True,
            "control_7.7": True,
            "control_8.8": True,
            "control_8.15": False,
            "control_8.20": True,
        }
    
    result = await analyzer.analyze_organization_compliance(organization_data)
    
    return result

@router.post("/generate-report")
async def generate_compliance_report(
    analysis_result: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Generar reporte de cumplimiento en formato Markdown/PDF"""
    analyzer = ISOComplianceAnalyzer()
    report = await analyzer.generate_compliance_report(analysis_result)
    
    return {
        "report": report,
        "format": "markdown",
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/risk-assessment")
async def get_risk_assessment(
    current_user: dict = Depends(get_current_user)
):
    """Obtener matriz de riesgos basada en ISO 27005"""
    risk_matrix = {
        "risk_levels": {
            "critical": {
                "score_range": "16-25",
                "action": "Inmediata",
                "color": "red",
                "examples": ["Pérdida de datos críticos", "Violación de cumplimiento legal"]
            },
            "high": {
                "score_range": "10-15",
                "action": "Prioritaria",
                "color": "orange",
                "examples": ["Acceso no autorizado", "Fuga de información confidencial"]
            },
            "medium": {
                "score_range": "5-9",
                "action": "Planificada",
                "color": "yellow",
                "examples": ["Malware", "Phishing"]
            },
            "low": {
                "score_range": "1-4",
                "action": "Monitorizar",
                "color": "green",
                "examples": ["Errores de usuario", "Configuraciones incorrectas"]
            }
        },
        "calculation_method": "Likelihood × Impact = Risk Score",
        "likelihood_scale": {
            "1": "Muy Bajo",
            "2": "Bajo",
            "3": "Medio",
            "4": "Alto",
            "5": "Muy Alto"
        },
        "impact_scale": {
            "1": "Insignificante",
            "2": "Menor",
            "3": "Moderado",
            "4": "Mayor",
            "5": "Catastrófico"
        }
    }
    
    return risk_matrix