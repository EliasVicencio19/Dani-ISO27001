from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, Optional
from datetime import datetime

from app.services.iso_compliance_analyzer import ISOComplianceAnalyzer
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["ISO 27001 Compliance"])

analyzer = ISOComplianceAnalyzer()

@router.get("/controls")
async def get_all_controls(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if category:
        controls = analyzer.get_controls_by_category(category)
        return {"category": category, "total": len(controls), "controls": controls}
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

@router.post("/assess/{control_id}")
async def assess_control(
    control_id: str,
    evidence: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    result = analyzer.assess_control(control_id, evidence)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/full-assessment")
async def full_assessment(
    organization_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    all_controls = analyzer.get_all_controls().get("controls", [])
    assessments = []
    
    for control in all_controls:
        evidence = {
            "has_security_policy": organization_data.get("has_security_policy", False),
            "policy_approved_by_management": organization_data.get("policy_approved_by_management", False),
            "policy_communicated": organization_data.get("policy_communicated", False),
            "has_antivirus": organization_data.get("has_antivirus", False),
            "has_backup": organization_data.get("has_backup", False)
        }
        assessments.append(analyzer.assess_control(control["id"], evidence))
    
    summary = analyzer.get_compliance_summary(assessments)
    
    return {
        "organization": organization_data.get("name", "Organización"),
        "assessment_date": datetime.utcnow().isoformat(),
        "summary": summary,
        "detailed_assessments": assessments
    }
