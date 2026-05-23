# scripts/ingest_normativa.py
import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Agregar el directorio raíz al path para importar desde "app"
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import delete
from app.dependencies.database import engine, AsyncSessionLocal, Base
from app.models.normative_chunk import NormativeChunk
from app.services.embedding_service import EmbeddingService

# Cargar .env desde la raíz del backend
load_dotenv(Path(__file__).parent.parent / ".env")

async def ingest_normative_docs():
    print("📚 Iniciando ingesta de la Base Normativa ISO 27001 / 27002...")
    
    # 1. Asegurar que las tablas existan
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # 2. Definir rutas a los PDFs
    backend_root = Path(__file__).parent.parent
    workspace_root = backend_root.parent # Dani-ISO27001
    docs_dir = workspace_root / "Documentación"
    
    pdf_files = {
        "ISO 27001-2022 Español": docs_dir / "ISO 27001-2022 Español.pdf",
        "ISO_IEC 27002-2022 ESP": docs_dir / "ISO_IEC 27002-2022 ESP.pdf"
    }
    
    # Validar que los archivos existan
    for name, path in pdf_files.items():
        if not path.exists():
            print(f"❌ ERROR: No se encontró el archivo PDF para {name} en la ruta:\n   {path}")
            print("Por favor, asegúrate de colocar los archivos en la carpeta 'Documentación'.")
            return

    # 3. Inicializar el servicio de embeddings
    embedding_service = EmbeddingService()
    
    # 4. Procesar y almacenar
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Limpiar registros previos para evitar duplicados en reprocesamientos
            print("🧹 Limpiando base normativa existente en la base de datos...")
            await session.execute(delete(NormativeChunk))
            
            for doc_name, path in pdf_files.items():
                print(f"📄 Procesando {doc_name}...")
                # Llamar al servicio avanzado para extraer, fragmentar y generar embeddings
                chunks_data = embedding_service.process_normative_pdf(str(path), doc_name)
                
                if not chunks_data:
                    print(f"⚠️ Advertencia: No se extrajeron fragmentos de {doc_name}. Verifica las dependencias.")
                    continue
                
                print(f"💾 Guardando {len(chunks_data)} fragmentos en la base de datos...")
                for item in chunks_data:
                    chunk_obj = NormativeChunk(
                        document_name=item["document_name"],
                        clause=item["clause"],
                        page_number=item["page_number"],
                        chunk_index=item["chunk_index"],
                        content=item["content"],
                        raw_text=item["raw_text"],
                        embedding=item["embedding"]
                    )
                    session.add(chunk_obj)
                    
    print("✅ Ingesta de base normativa finalizada con éxito en PostgreSQL.")

if __name__ == "__main__":
    asyncio.run(ingest_normative_docs())
