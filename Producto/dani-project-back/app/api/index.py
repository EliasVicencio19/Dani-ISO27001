# app/api/index.py
# Entrypoint para Vercel: el runtime de Python de Vercel detecta
# automáticamente una variable de módulo llamada "app" como aplicación ASGI.
# No se necesita Mangum (eso es para AWS Lambda) — FastAPI se sirve directo.

from app.main import app as app