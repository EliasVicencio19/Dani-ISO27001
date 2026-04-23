from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DANI27001"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/dani27001"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    DEBUG: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Google Cloud (for Storage & Pub/Sub)
    GOOGLE_CLOUD_PROJECT: str
    GOOGLE_APPLICATION_CREDENTIALS: str
    CLOUD_STORAGE_BUCKET: str
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://your-vercel-app.vercel.app"]
    
    # Vector Store (Pinecone/Qdrant/Chroma)
    VECTOR_STORE_API_KEY: str
    VECTOR_STORE_ENVIRONMENT: str = "gcp-starter"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()