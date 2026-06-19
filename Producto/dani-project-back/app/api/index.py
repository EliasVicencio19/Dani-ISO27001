# app/api/index.py
# CAMBIO TOTAL: este archivo era una mini-API Flask de prueba (login con
# password en texto plano, sin relación con tu sistema real). Vercel lo
# tomaba como el handler de producción, por lo que tu FastAPI real
# (app/main.py, con auth/risk/evidence/compliance/chat/etc.) NUNCA se estaba
# sirviendo en el despliegue. Aquí lo reemplazamos para que Vercel sirva tu
# app FastAPI real, envuelta con Mangum (ya estaba en requirements.txt).

from mangum import Mangum
from app.main import app as fastapi_app

# Mangum traduce eventos de función serverless (estilo AWS Lambda, que es lo
# que Vercel usa por debajo en su runtime Python) a peticiones ASGI que
# FastAPI entiende.
handler = Mangum(fastapi_app, lifespan="off")

# CAMBIO: lifespan="off" porque el "lifespan" de tu app (crear extensión
# vector + usuario admin en cada arranque, ver app/main.py) no debe correr en
# cada invocación serverless fría. Ver el script aparte
# scripts/setup_supabase.py para correr ese setup una sola vez de forma manual.
