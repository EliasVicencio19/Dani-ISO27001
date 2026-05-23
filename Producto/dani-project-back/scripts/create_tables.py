# scripts/create_tables.py
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.dependencies.database import engine, Base
from app.models.gap_analysis import GapAnalysis, RemediationAction, KPI, ControlImplementation
from app.models.user import User
from app.models.risk import Risk
from app.models.evidence import Evidence
from app.models.assessment import RiskAssessment
from app.models.iso_controls import ISOCControl

async def create_tables():
    """Crear todas las tablas en la base de datos"""
    print("📊 Creando tablas en la base de datos...")
    
    async with engine.begin() as conn:
        # Crear todas las tablas
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Tablas creadas exitosamente")
    print("   - users")
    print("   - risks")
    print("   - evidences")
    print("   - risk_assessments")
    print("   - iso_controls")
    print("   - gap_analysis")
    print("   - remediation_actions")
    print("   - kpi")
    print("   - control_implementation")

async def main():
    await create_tables()

if __name__ == "__main__":
    asyncio.run(main())