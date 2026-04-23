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
