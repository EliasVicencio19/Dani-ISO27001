# scripts/init_gap_analysis.py
import asyncio
import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.dependencies.database import AsyncSessionLocal
from app.models.gap_analysis import GapAnalysis, RemediationAction, KPI, PriorityLevel, GapStatus
from app.services.gap_analyzer import GapAnalyzer

async def init_gap_analysis():
    """Inicializar análisis de brecha en la base de datos"""
    print("📊 Inicializando Gap Analysis...")
    
    async with AsyncSessionLocal() as session:
        analyzer = GapAnalyzer(session)
        
        # Generar análisis completo
        analysis = await analyzer.generate_complete_gap_analysis()
        
        # Guardar brechas por cláusula
        for clause in analysis["clause_gaps"]:
            gap = GapAnalysis(
                clause_id=clause["clause_id"],
                clause_name=clause["clause_name"],
                requirement=f"Cláusula {clause['clause_id']} completa",
                current_status=f"{clause['current_score']}% cumplimiento",
                target_status=f"{clause['target_score']}% objetivo",
                gap_description=f"Brecha de {clause['gap']}%",
                priority=clause["priority"],
                status=GapStatus.PENDING
            )
            session.add(gap)
        
        # Guardar KPIs
        for kpi_data in analyzer._get_default_kpis():
            kpi = KPI(**kpi_data)
            session.add(kpi)
        
        await session.commit()
    
    print("✅ Gap Analysis inicializado")
    print(f"   - Score general: {analysis['overall_score']['overall_score']}%")
    print(f"   - Preparación: {analysis['certification_readiness']}")
    print(f"   - Brechas identificadas: {len(analysis['clause_gaps'])}")
    print(f"   - Horas estimadas: {analysis['remediation_plan']['total_hours']}h")
    print(f"   - Costo estimado: ${analysis['remediation_plan']['estimated_cost_usd']}")

async def main():
    await init_gap_analysis()

if __name__ == "__main__":
    asyncio.run(main())