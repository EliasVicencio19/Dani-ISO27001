# backend/api/index.py
import sys
from pathlib import Path

# Agregar la carpeta backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from mangum import Mangum
from app.main import app

# Handler para Vercel
handler = Mangum(app)