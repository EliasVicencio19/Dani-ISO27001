#!/bin/bash

echo "🚀 Setting up DANI27001 Backend Environment..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Python
echo -e "${YELLOW}1. Verificando Python...${NC}"
if command -v python3 &>/dev/null; then
    python_version=$(python3 --version)
    echo -e "${GREEN}✓ Python encontrado: $python_version${NC}"
else
    echo -e "${RED}✗ Python no encontrado. Por favor instala Python 3.9+${NC}"
    exit 1
fi

# 2. Crear entorno virtual
echo -e "\n${YELLOW}2. Creando entorno virtual...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Entorno virtual creado${NC}"
else
    echo -e "${GREEN}✓ Entorno virtual ya existe${NC}"
fi

# 3. Activar entorno virtual
echo -e "\n${YELLOW}3. Activando entorno virtual...${NC}"
source venv/bin/activate

# 4. Actualizar pip
echo -e "\n${YELLOW}4. Actualizando pip...${NC}"
pip install --upgrade pip

# 5. Instalar dependencias
echo -e "\n${YELLOW}5. Instalando dependencias...${NC}"
pip install -r requirements.txt

# 6. Verificar PostgreSQL
echo -e "\n${YELLOW}6. Verificando PostgreSQL...${NC}"
if command -v psql &>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL encontrado${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL no encontrado. Instalando con Docker...${NC}"
    docker run --name postgres-dani27001 \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=dani27001 \
        -p 5432:5432 \
        -d postgres:15-alpine
    echo -e "${GREEN}✓ PostgreSQL ejecutándose en Docker${NC}"
fi

# 7. Verificar Redis
echo -e "\n${YELLOW}7. Verificando Redis...${NC}"
if command -v redis-cli &>/dev/null; then
    echo -e "${GREEN}✓ Redis encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Redis no encontrado. Instalando con Docker...${NC}"
    docker run --name redis-dani27001 \
        -p 6379:6379 \
        -d redis:7-alpine
    echo -e "${GREEN}✓ Redis ejecutándose en Docker${NC}"
fi

# 8. Crear archivo .env
echo -e "\n${YELLOW}8. Creando archivo .env...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dani27001
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DEBUG=True

# Redis
REDIS_URL=redis://localhost:6379

# Security (CAMBIAR EN PRODUCCIÓN)
SECRET_KEY=your-secret-key-change-this-in-production-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# OpenAI (opcional por ahora)
OPENAI_API_KEY=your-openai-api-key

# Google Cloud (opcional por ahora)
GOOGLE_CLOUD_PROJECT=your-project
CLOUD_STORAGE_BUCKET=your-bucket

# Vector Store (opcional por ahora)
VECTOR_STORE_API_KEY=your-key
EOF
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# 9. Crear script de inicialización de BD
echo -e "\n${YELLOW}9. Creando script de inicialización de BD...${NC}"
cat > scripts/init_db.py << 'EOF'
import asyncio
import sys
from pathlib import Path

# Agregar backend al path
sys.path.append(str(Path(__file__).parent.parent))

from app.database import engine, Base
from app.models.user import User
from app.models.risk import Risk
from app.models.evidence import Evidence
from app.models.assessment import RiskAssessment

async def init_database():
    """Crear todas las tablas"""
    print("📊 Inicializando base de datos...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tablas creadas exitosamente")

async def create_test_user():
    """Crear usuario de prueba"""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.services.auth_service import AuthService
    from app.models.user import User, UserRole
    
    async with AsyncSession(engine) as session:
        # Verificar si ya existe
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "admin@dani27001.com")
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            test_user = User(
                email="admin@dani27001.com",
                full_name="Admin User",
                hashed_password=AuthService.get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(test_user)
            await session.commit()
            print("✅ Usuario de prueba creado: admin@dani27001.com / admin123")
        else:
            print("ℹ Usuario de prueba ya existe")

if __name__ == "__main__":
    asyncio.run(init_database())
    asyncio.run(create_test_user())
EOF
echo -e "${GREEN}✓ Script de inicialización creado${NC}"

# 10. Crear script de pruebas rápidas
echo -e "\n${YELLOW}10. Creando script de pruebas...${NC}"
cat > scripts/test_api.sh << 'EOF'
#!/bin/bash

echo "🧪 Probando API de DANI27001..."

# 1. Health check
echo -e "\n1. Health Check:"
curl -s http://localhost:8000/health | python3 -m json.tool

# 2. Login
echo -e "\n2. Login:"
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dani27001.com","password":"admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -n "$TOKEN" ]; then
    echo "✓ Login exitoso"
    
    # 3. Crear riesgo
    echo -e "\n3. Creando riesgo de prueba:"
    curl -s -X POST http://localhost:8000/api/risks/ \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Riesgo de prueba - Seguridad de datos",
        "description": "Posible fuga de información confidencial",
        "category": "security",
        "likelihood": 4,
        "impact": 5,
        "owner": "admin@dani27001.com"
      }' | python3 -m json.tool
    
    # 4. Obtener estadísticas
    echo -e "\n4. Estadísticas de riesgos:"
    curl -s -X GET http://localhost:8000/api/risks/statistics \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -m json.tool
else
    echo "✗ Error en login"
fi
EOF
chmod +x scripts/test_api.sh
echo -e "${GREEN}✓ Script de pruebas creado${NC}"

echo -e "\n${GREEN}✅ Setup completado!${NC}"
echo -e "\n${YELLOW}Próximos pasos:${NC}"
echo "1. source venv/bin/activate          # Activar entorno virtual"
echo "2. python scripts/init_db.py         # Inicializar base de datos"
echo "3. python -m app.main                # Iniciar servidor"
echo "4. En otra terminal: ./scripts/test_api.sh  # Probar API"
echo ""
echo "📝 Credenciales de prueba:"
echo "   Email: admin@dani27001.com"
echo "   Password: admin123"