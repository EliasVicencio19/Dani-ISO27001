from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import AsyncSessionLocal

class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Crear sesión para la request
        async with AsyncSessionLocal() as session:
            request.state.db = session
            response = await call_next(request)
            return response