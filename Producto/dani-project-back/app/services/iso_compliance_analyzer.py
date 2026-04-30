# app/services/iso_compliance_analyzer.py
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path

class ISOComplianceAnalyzer:
    """Analizador de cumplimiento ISO 27001:2022"""
    
    def __init__(self):
        self.controls_file = Path(__file__).parent.parent / "data" / "iso_controls.json"
        self.controls_data = self._load_controls()
    
    def _load_controls(self) -> Dict:
        """Cargar controles desde archivo JSON"""
        if self.controls_file.exists():
            with open(self.controls_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def get_all_controls(self) -> Dict:
        """Obtener todos los controles"""
        return self.controls_data
    
    def get_controls_by_category(self, category: str) -> List:
        """Obtener controles por categoría"""
        if not self.controls_data:
            return []
        return [c for c in self.controls_data.get("controls", []) if c["category"] == category]
    
    def assess_control(self, control_id: str, evidence: Dict) -> Dict:
        """Evaluar un control específico"""
        # Buscar el control
        control = None
        for c in self.controls_data.get("controls", []):
            if c["id"] == control_id:
                control = c
                break
        
        if not control:
            return {"error": f"Control {control_id} no encontrado"}
        
        # Evaluación básica
        compliance_score = 0
        findings = []
        recommendations = []
        
        if control_id == "5.1":  # Políticas de seguridad
            if evidence.get("has_security_policy"):
                compliance_score += 50
            else:
                findings.append("No existe política de seguridad documentada")
                recommendations.append("Desarrollar e implementar política de seguridad")
            
            if evidence.get("policy_approved_by_management"):
                compliance_score += 25
            else:
                findings.append("Política no aprobada por dirección")
            
            if evidence.get("policy_communicated"):
                compliance_score += 25
            else:
                findings.append("Política no comunicada al personal")
        
        elif control_id == "8.13":  # Copia de seguridad
            if evidence.get("has_backup"):
                compliance_score += 40
            else:
                findings.append("No se realizan copias de seguridad")
            
            if evidence.get("has_backup_policy"):
                compliance_score += 30
            else:
                recommendations.append("Definir política de backup")
            
            if evidence.get("has_restore_tests"):
                compliance_score += 30
                recommendations.append("Realizar pruebas de restauración")
        
        elif control_id == "8.7":  # Antivirus
            if evidence.get("has_antivirus"):
                compliance_score += 50
            else:
                findings.append("No hay protección antivirus")
            
            if evidence.get("antivirus_updated"):
                compliance_score += 50
            else:
                findings.append("Antivirus no actualizado")
        
        else:
            compliance_score = evidence.get("compliance_score", 50)
        
        is_compliant = compliance_score >= 70
        
        return {
            "control_id": control_id,
            "control_title": control["title"],
            "category": control["category"],
            "evaluation_date": datetime.utcnow().isoformat(),
            "is_compliant": is_compliant,
            "compliance_score": compliance_score,
            "findings": findings,
            "recommendations": recommendations
        }
    
    def get_compliance_summary(self, assessments: List[Dict]) -> Dict:
        """Generar resumen de cumplimiento"""
        if not assessments:
            return {"total_controls_assessed": 0, "compliant_controls": 0, "overall_compliance_score": 0}
        
        total = len(assessments)
        compliant = sum(1 for a in assessments if a.get("is_compliant", False))
        overall_score = sum(a.get("compliance_score", 0) for a in assessments) / total if total > 0 else 0
        
        return {
            "total_controls_assessed": total,
            "compliant_controls": compliant,
            "non_compliant_controls": total - compliant,
            "overall_compliance_score": round(overall_score, 1)
        }