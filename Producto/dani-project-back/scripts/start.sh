#!/bin/bash

# Script para iniciar todo el entorno
echo "🚀 Iniciando DANI27001 Backend..."

# Activar entorno virtual
source venv/bin/activate

# Verificar que PostgreSQL esté corriendo
if ! docker ps | grep -q postgres-dani27001; then
    echo "Iniciando PostgreSQL..."
    docker start postgres-dani27001 2>/dev/null || \
    docker run --name postgres-dani27001 \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=dani27001 \
        -p 5432:5432 \
        -d postgres:15-alpine
fi

# Verificar que Redis esté corriendo
if ! docker ps | grep -q redis-dani27001; then
    echo "Iniciando Redis..."
    docker start redis-dani27001 2>/dev/null || \
    docker run --name redis-dani27001 \
        -p 6379:6379 \
        -d redis:7-alpine
fi

# Inicializar base de datos si es necesario
echo "Inicializando base de datos..."
python scripts/init_db.py

# Iniciar servidor FastAPI
echo "Iniciando servidor FastAPI..."
python -m app.main