from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uvicorn

# Crear la aplicación FastAPI
app = FastAPI(
    title="DANI27001 API",
    description="Sistema de Gestión de Cumplimiento ISO 27001",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ MODELOS DE DATOS ============
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RiskCreate(BaseModel):
    title: str
    description: str
    category: str = "security"
    likelihood: int = 1
    impact: int = 1
    owner: str

class RiskResponse(BaseModel):
    id: str
    title: str
    description: str
    risk_level: str
    status: str
    created_at: datetime
    owner: str

# ============ BASE DE DATOS EN MEMORIA (PARA PRUEBAS) ============
users_db = {
    "admin@dani27001.com": {
        "password": "admin123",
        "full_name": "Admin User",
        "role": "admin"
    },
    "auditor@dani27001.com": {
        "password": "auditor123",
        "full_name": "Auditor Test",
        "role": "auditor"
    }
}

risks_db = []
risk_counter = 1

# ============ ENDPOINTS ============

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "DANI27001 API - Sistema funcionando correctamente",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "login": "/api/auth/login",
            "risks": "/api/risks"
        }
    }

@app.get("/health")
async def health_check():
    """Verificar estado del servidor"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "server": "running"
    }

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """Autenticar usuario y obtener token"""
    if login_data.email in users_db and users_db[login_data.email]["password"] == login_data.password:
        # Token simple para pruebas
        token = f"token-{login_data.email}-{int(datetime.utcnow().timestamp())}"
        return TokenResponse(access_token=token)
    
    raise HTTPException(
        status_code=401,
        detail="Credenciales inválidas. Usa: admin@dani27001.com / admin123"
    )

@app.post("/api/risks/", response_model=RiskResponse)
async def create_risk(risk_data: RiskCreate):
    """Crear un nuevo riesgo"""
    global risk_counter
    
    # Calcular nivel de riesgo automáticamente
    risk_score = risk_data.likelihood * risk_data.impact
    if risk_score >= 15:
        risk_level = "critical"
    elif risk_score >= 8:
        risk_level = "high"
    elif risk_score >= 4:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    risk = {
        "id": str(risk_counter),
        "title": risk_data.title,
        "description": risk_data.description,
        "risk_level": risk_level,
        "status": "open",
        "created_at": datetime.utcnow(),
        "owner": risk_data.owner
    }
    
    risks_db.append(risk)
    risk_counter += 1
    
    return RiskResponse(**risk)

@app.get("/api/risks/", response_model=List[RiskResponse])
async def get_risks():
    """Obtener todos los riesgos"""
    return risks_db

@app.get("/api/risks/{risk_id}")
async def get_risk_by_id(risk_id: str):
    """Obtener un riesgo específico por ID"""
    for risk in risks_db:
        if risk["id"] == risk_id:
            return risk
    raise HTTPException(status_code=404, detail="Riesgo no encontrado")

@app.put("/api/risks/{risk_id}/status")
async def update_risk_status(risk_id: str, status: str):
    """Actualizar estado de un riesgo"""
    for risk in risks_db:
        if risk["id"] == risk_id:
            if status not in ["open", "in_review", "mitigated", "closed"]:
                raise HTTPException(status_code=400, detail="Estado inválido")
            risk["status"] = status
            return {"message": "Estado actualizado", "risk": risk}
    raise HTTPException(status_code=404, detail="Riesgo no encontrado")

@app.get("/api/risks/statistics")
async def get_statistics():
    """Obtener estadísticas de riesgos"""
    stats = {
        "total": len(risks_db),
        "by_level": {
            "critical": len([r for r in risks_db if r["risk_level"] == "critical"]),
            "high": len([r for r in risks_db if r["risk_level"] == "high"]),
            "medium": len([r for r in risks_db if r["risk_level"] == "medium"]),
            "low": len([r for r in risks_db if r["risk_level"] == "low"])
        },
        "by_status": {
            "open": len([r for r in risks_db if r["status"] == "open"]),
            "in_review": len([r for r in risks_db if r["status"] == "in_review"]),
            "mitigated": len([r for r in risks_db if r["status"] == "mitigated"]),
            "closed": len([r for r in risks_db if r["status"] == "closed"])
        }
    }
    return stats

# ============ INICIAR SERVIDOR ============
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 DANI27001 API Server")
    print("=" * 60)
    print(f"📡 Servidor: http://127.0.0.1:8000")
    print(f"📖 Documentación Swagger: http://127.0.0.1:8000/docs")
    print(f"📚 Documentación ReDoc: http://127.0.0.1:8000/redoc")
    print(f"🔍 Health check: http://127.0.0.1:8000/health")
    print("=" * 60)
    print("\n✨ CREDENCIALES DE PRUEBA:")
    print("   📧 admin@dani27001.com")
    print("   🔑 admin123")
    print("\n📝 Usuarios adicionales:")
    print("   📧 auditor@dani27001.com")
    print("   🔑 auditor123")
    print("\n" + "=" * 60)
    print("\n💡 Para probar con Postman:")
    print("   1. POST http://localhost:8000/api/auth/login")
    print("   2. Usar el token en Authorization: Bearer {token}")
    print("   3. Probar POST /api/risks/ o GET /api/risks/")
    print("=" * 60)
    print("\n🔄 Servidor iniciado... Presiona CTRL+C para detener\n")
    
    # Iniciar servidor
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        access_log=True
    )