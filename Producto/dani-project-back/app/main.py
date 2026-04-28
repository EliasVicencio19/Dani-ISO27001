from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import redis.asyncio as redis
from contextlib import asynccontextmanager

from app.config import settings
from app.routes import auth, risk, dashboard
# from app.utils.redis_client import RedisClient
# from app.utils.pubsub import PubSubManager
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # app.state.redis = await RedisClient.create(settings.REDIS_URL)
    # app.state.pubsub = PubSubManager(app.state.redis)
    yield
    # Shutdown
    # await app.state.redis.close()

app = FastAPI(
    title="DANI27001 Backend API",
    description="Security Compliance Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(risk.router, prefix="/api/risks", tags=["Risk Management"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
# app.include_router(evidence.router, prefix="/api/evidence", tags=["Evidence"])
# app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

@app.get("/")
async def root():
    return {"message": "DANI27001 API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}