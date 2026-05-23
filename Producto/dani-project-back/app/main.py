# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import uuid
from datetime import datetime
from app.routes import chat
from app.routes import gap_analysis

from app.config import settings
from app.dependencies.database import engine, Base, AsyncSessionLocal
from app.routes import auth, risk, evidence, documents, users
from app.routes import compliance
from app.models.iso_controls import ISOCControl


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# app/main.py - Corregido
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting DANI27001 Backend...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")
    
    # Crear usuario admin por defecto
    from app.services.auth_service import AuthService
    from app.models.user import User, UserRole
    
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@dani27001.com"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin_user = User(
                id=str(uuid.uuid4()),
                full_name="Admin User",
                email="admin@dani27001.com",
                hashed_password=AuthService.get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            logger.info("✅ Admin user created: admin@dani27001.com / admin123")
    
    logger.info("✅ Backend ready!")
    yield
    
    # Shutdown
    logger.info("👋 Shutting down...")
    await engine.dispose()

# Crear la aplicación FastAPI
app = FastAPI(
    title="DANI27001 API",
    description="Security Compliance Management System for ISO 27001",
    version="1.0.0",
    lifespan=lifespan
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

'''''
"http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
'''''

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(risk.router)
app.include_router(evidence.router)
app.include_router(documents.router)
app.include_router(compliance.router)
app.include_router(chat.router)  
app.include_router(gap_analysis.router)        

@app.get("/")
async def root():
    return {
        "message": "DANI27001 API",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 🔴 IMPORTANTE: Esto es lo que faltaba
if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🚀 Iniciando servidor FastAPI")
    print("=" * 50)
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False  # Cambia a True solo en desarrollo
    )