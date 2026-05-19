# app/services/embedding_service.py
import os
import logging
import re
from typing import List, Optional

logger = logging.getLogger(__name__)

# Intentar importar fastembed
try:
    from fastembed import TextEmbedding
    FASTEMBED_AVAILABLE = True
except ImportError:
    FASTEMBED_AVAILABLE = False
    logger.warning("⚠️ La librería 'fastembed' no está instalada. Ejecutando EmbeddingService en MODO SIMULADO de respaldo.")

# Intentar importar pymupdf (fitz)
try:
    import fitz
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logger.warning("⚠️ La librería 'pymupdf' (fitz) no está instalada. El extractor de PDF avanzado no estará disponible.")

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


class EmbeddingService:
    def __init__(self):
        # Intentamos usar un modelo multilingüe de 384 dimensiones para dar soporte nativo al español
        self.model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        self.embedding_model = None
        
        if FASTEMBED_AVAILABLE:
            try:
                self.embedding_model = TextEmbedding(model_name=self.model_name)
                logger.info(f"✅ Modelo de embeddings multilingüe '{self.model_name}' inicializado con éxito.")
            except Exception as e:
                logger.warning(f"⚠️ No se pudo inicializar '{self.model_name}': {e}. Reintentando con BAAI/bge-small-en-v1.5.")
                try:
                    self.model_name = "BAAI/bge-small-en-v1.5"
                    self.embedding_model = TextEmbedding(model_name=self.model_name)
                    logger.info(f"✅ Fallback exitoso: Modelo '{self.model_name}' inicializado.")
                except Exception as fallback_err:
                    logger.error(f"❌ Error al cargar modelo de fallback: {fallback_err}. Activando modo simulado.")
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
                if PYMUPDF_AVAILABLE:
                    # Usar PyMuPDF como primera opción por su calidad de extracción y orden de lectura
                    doc = fitz.open(file_path)
                    for page in doc:
                        extracted = page.get_text()
                        if extracted:
                            text += extracted + "\n"
                elif PYPDF_AVAILABLE:
                    # Fallback a pypdf
                    with open(file_path, "rb") as f:
                        reader = pypdf.PdfReader(f)
                        for page in reader.pages:
                            extracted = page.extract_text()
                            if extracted:
                                text += extracted + "\n"
                            
            # 2. Procesar Word (DOCX)
            elif "word" in mime_type or "officedocument" in mime_type or file_path.lower().endswith(".docx"):
                if DOCX_AVAILABLE:
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
        """
        Divide un bloque de texto en fragmentos lógicos con solapamiento.
        Usa un Recursive Character Splitter para respetar saltos de párrafo, oraciones y palabras.
        """
        if not text:
            return []
            
        chunks = []
        separators = ["\n\n", "\n", ". ", " ", ""]
        
        def _split_recursive(text_to_split: str, separators_list: List[str]) -> List[str]:
            if len(text_to_split) <= chunk_size:
                return [text_to_split]
                
            # Buscar el separador con mayor jerarquía disponible
            separator = ""
            for sep in separators_list:
                if sep in text_to_split:
                    separator = sep
                    break
                    
            if separator == "":
                # Fallback: división rígida por tamaño
                start = 0
                sub_chunks = []
                while start < len(text_to_split):
                    sub_chunks.append(text_to_split[start:start+chunk_size])
                    start += chunk_size - overlap
                return sub_chunks
                
            # Dividir usando el separador encontrado
            splits = text_to_split.split(separator)
            final_chunks = []
            current_buffer = []
            current_length = 0
            
            for part in splits:
                if not part.strip():
                    continue
                # Si agregar la parte excede el tamaño, guardamos el buffer actual
                if current_length + len(part) + len(separator) > chunk_size:
                    if current_buffer:
                        joined = separator.join(current_buffer)
                        final_chunks.append(joined)
                        # Re-construir el buffer considerando el solapamiento (overlap)
                        overlap_buffer = []
                        overlap_len = 0
                        for p in reversed(current_buffer):
                            if overlap_len + len(p) + len(separator) <= overlap:
                                overlap_buffer.insert(0, p)
                                overlap_len += len(p) + len(separator)
                            else:
                                break
                        current_buffer = overlap_buffer
                        current_length = overlap_len
                
                current_buffer.append(part)
                current_length += len(part) + len(separator)
                
            if current_buffer:
                final_chunks.append(separator.join(current_buffer))
                
            # División recursiva si algún fragmento sigue excediendo el tamaño límite
            refined_chunks = []
            next_seps = separators_list[separators_list.index(separator)+1:]
            for chunk in final_chunks:
                if len(chunk) > chunk_size and len(next_seps) > 0:
                    refined_chunks.extend(_split_recursive(chunk, next_seps))
                else:
                    refined_chunks.append(chunk)
                    
            return refined_chunks

        return _split_recursive(text, separators)

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Genera representaciones vectoriales para una lista de textos."""
        if not texts:
            return []
            
        # Si fastembed está disponible, calcular vectores reales
        if self.embedding_model:
            try:
                embeddings_generator = self.embedding_model.embed(texts)
                return [list(e) for e in embeddings_generator]
            except Exception as e:
                logger.error(f"Error generando embeddings con fastembed: {e}")
                
        # Fallback / Modo Simulado: Generar vectores deterministicos simulados de 384 dimensiones
        logger.warning("⚙️ Generando embeddings simulados de 384 dimensiones para la demo.")
        simulated_embeddings = []
        for text in texts:
            h = hash(text)
            vector = []
            for i in range(384):
                val = ((h * (i + 1)) % 1000) / 1000.0 - 0.5
                vector.append(val)
            simulated_embeddings.append(vector)
            
        return simulated_embeddings

    def generate_single_embedding(self, text: str) -> List[float]:
        """Genera el embedding para un único texto."""
        vectors = self.generate_embeddings([text])
        return vectors[0] if vectors else [0.0] * 384

    def process_normative_pdf(self, file_path: str, document_name: str) -> List[dict]:
        """
        Procesa un PDF de base normativa aplicando extracción avanzada (cabeceras/pies recortados),
        chunking contextual y generación de embeddings.
        
        Retorna una lista de diccionarios listos para insertar en PostgreSQL.
        """
        if not PYMUPDF_AVAILABLE:
            logger.error("❌ No se puede procesar la base normativa de forma avanzada porque 'pymupdf' no está disponible.")
            return []
            
        if not os.path.exists(file_path):
            logger.error(f"❌ El archivo no existe en: {file_path}")
            return []
            
        doc = fitz.open(file_path)
        processed_chunks = []
        
        # Regex para detectar cláusulas o controles ISO comunes (ej: Cláusula 5.2, Control A.8.24)
        clause_regex = re.compile(
            r'(?:Cl[áa]usula|Secci[oó]n|Control)\s+(\d+(?:\.\d+)*)|(A\.\d+\.\d+)', 
            re.IGNORECASE
        )
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            rect = page.rect
            height = rect.height
            
            # Recorte inteligente de cabecera y pie de página (8% superior e inferior)
            header_threshold = height * 0.08
            footer_threshold = height * 0.92
            
            blocks = page.get_text("blocks")
            # Ordenamos los bloques: primero arriba-abajo (y0), luego izquierda-derecha (x0)
            blocks.sort(key=lambda b: (b[1], b[0]))
            
            page_text_blocks = []
            for b in blocks:
                x0, y0, x1, y1, text, block_no, block_type = b
                if y0 > header_threshold and y1 < footer_threshold:
                    clean_text = text.strip()
                    if clean_text:
                        page_text_blocks.append(clean_text)
            
            page_text = "\n".join(page_text_blocks)
            if not page_text.strip():
                continue
                
            # Intentar detectar la sección o cláusula ISO en esta página
            match = clause_regex.search(page_text)
            clause_reference = "General"
            if match:
                clause_reference = match.group(1) or match.group(2)
                
            # Fragmentación recursiva para mantener unidades semánticas
            raw_chunks = self.chunk_text(page_text, chunk_size=1000, overlap=200)
            
            for idx, raw_chunk in enumerate(raw_chunks):
                # Prefijo de contexto jerárquico enriquecido
                context_prefix = f"[Norma: {document_name} | Cláusula: {clause_reference} | Página: {page_num + 1}]\n"
                enriched_content = context_prefix + raw_chunk
                
                # Generar embedding del texto enriquecido
                embedding = self.generate_single_embedding(enriched_content)
                
                processed_chunks.append({
                    "document_name": document_name,
                    "clause": clause_reference,
                    "page_number": page_num + 1,
                    "chunk_index": idx,
                    "content": enriched_content,
                    "raw_text": raw_chunk,
                    "embedding": embedding
                })
                
        logger.info(f"✅ Procesados con éxito {len(processed_chunks)} fragmentos RAG para {document_name}.")
        return processed_chunks
