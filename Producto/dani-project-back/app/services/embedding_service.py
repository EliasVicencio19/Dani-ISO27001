# app/services/embedding_service.py
import os
import logging
from typing import List, Optional
import pypdf
import docx

logger = logging.getLogger(__name__)

# Intentar importar fastembed, con fallback si no está instalado
try:
    from fastembed import TextEmbedding
    FASTEMBED_AVAILABLE = True
except ImportError:
    FASTEMBED_AVAILABLE = False
    logger.warning("⚠️ La librería 'fastembed' no está instalada. Ejecutando EmbeddingService en MODO SIMULADO de respaldo.")

class EmbeddingService:
    def __init__(self):
        self.model_name = "BAAI/bge-small-en-v1.5" # Modelo de 384 dimensiones
        self.embedding_model = None
        
        if FASTEMBED_AVAILABLE:
            try:
                # Inicializar el modelo localmente
                self.embedding_model = TextEmbedding(model_name=self.model_name)
                logger.info(f"✅ Modelo de embeddings '{self.model_name}' inicializado con éxito.")
            except Exception as e:
                logger.error(f"❌ Error al cargar el modelo de fastembed: {e}. Activando modo simulado.")
                self.embedding_model = None

    def extract_text_from_file(self, file_path: str, mime_type: str) -> str:
        """Extrae el texto completo de un archivo PDF, DOCX o TXT."""
        if not os.path.exists(file_path):
            logger.error(f"El archivo no existe en la ruta: {file_path}")
            return ""

        text = ""
        try:
            # 1. Procesar PDF
            if "pdf" in mime_type or file_path.lower().endswith(".pdf"):
                with open(file_path, "rb") as f:
                    reader = pypdf.PdfReader(f)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
                            
            # 2. Procesar Word (DOCX)
            elif "word" in mime_type or "officedocument" in mime_type or file_path.lower().endswith(".docx"):
                doc = docx.Document(file_path)
                for paragraph in doc.paragraphs:
                    if paragraph.text:
                        text += paragraph.text + "\n"
                        
            # 3. Procesar Texto plano (TXT)
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                    
        except Exception as e:
            logger.error(f"Error al extraer texto de {file_path}: {e}")
            
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
        """Divide un bloque de texto en fragmentos lógicos con solapamiento."""
        if not text:
            return []
            
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            # Intentar no cortar a la mitad de una palabra si hay espacio
            if end < text_len:
                # Buscar el último espacio en blanco en los últimos 50 caracteres del chunk
                last_space = text.rfind(" ", end - 50, end)
                if last_space != -1:
                    end = last_space
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
                
            start = end - overlap
            if start >= text_len or chunk_size <= overlap:
                break
                
        return chunks

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Genera representaciones vectoriales para una lista de textos."""
        if not texts:
            return []
            
        # Si fastembed está disponible, calcular vectores reales
        if self.embedding_model:
            try:
                embeddings_generator = self.embedding_model.embed(texts)
                # Convertir generador a lista de vectores (list of lists)
                return [list(e) for e in embeddings_generator]
            except Exception as e:
                logger.error(f"Error generando embeddings con fastembed: {e}")
                
        # Fallback / Modo Simulado: Generar vectores deterministicos simulados de 384 dimensiones
        # basados en la longitud y caracteres del texto para propósitos de demostración.
        logger.warning("⚙️ Generando embeddings simulados de 384 dimensiones para la demo.")
        simulated_embeddings = []
        for text in texts:
            # Creamos un vector pseudo-aleatorio basado en el hash del texto
            h = hash(text)
            vector = []
            for i in range(384):
                # Generar una distribución pseudo-normalizada
                val = ((h * (i + 1)) % 1000) / 1000.0 - 0.5
                vector.append(val)
            simulated_embeddings.append(vector)
            
        return simulated_embeddings

    def generate_single_embedding(self, text: str) -> List[float]:
        """Genera el embedding para un único texto."""
        vectors = self.generate_embeddings([text])
        return vectors[0] if vectors else [0.0] * 384
