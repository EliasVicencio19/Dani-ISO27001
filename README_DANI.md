# 🛡️ Proyecto DANI - Sistema de Gestión de Cumplimiento ISO 27001

Este documento resume la arquitectura y el flujo de datos del proyecto "DANI", plataforma avanzada de gestión de cumplimiento ISO 27001.

## 🏗️ Arquitectura General

El proyecto sigue una arquitectura cliente-servidor desacoplada:

- **Frontend (Cliente):** `Producto/dani-project-front`
  - React (Vite) con TailwindCSS para la interfaz de usuario.
  - Componentes funcionales y Hooks.
- **Backend (Servidor):** `Producto/dani-project-back`
  - Python con FastAPI.
  - Base de datos PostgreSQL alojada en Neon.tech, gestionada con SQLAlchemy (asíncrono).
  - Validaciones y esquemas mediante Pydantic.
- **Inteligencia Artificial:**
  - Integración con la API de DeepSeek consumida asíncronamente desde el backend.

## 📂 Estructura de Carpetas

### Frontend (`Producto/dani-project-front`)
- **`src/pages/`**: Vistas principales de la aplicación.
  - `Dashboard.jsx`: Panel principal.
  - `GapAnalysisScreen.jsx`: Análisis de brechas (Gap Analysis) y controles.
  - `DocGeneratorScreen.jsx`: Generador y exportador de reportes en PDF.
  - `ChatDANI.jsx`: Interfaz del chat interactivo con IA (50 prompts expertos).
  - `RiskMapScreen.jsx`, `EvidenceCenterScreen.jsx`, `AuditRoomScreen.jsx`, etc.
- **`src/services/`**:
  - `api.js`: Cliente centralizado usando `fetch` para comunicarse con el backend (Auth, Dashboard, Riesgos, Evidencia, Cumplimiento, Documentos, Chat IA).
- **`src/components/`** / **`src/contexts/`**: Componentes UI reutilizables y manejo de estado.

### Backend (`Producto/dani-project-back/app`)
- **`main.py`**: Punto de entrada de FastAPI, configuración de middlewares (CORS), conexión a base de datos (lifespan) y registro de enrutadores.
- **`routes/`**: Controladores de la API agrupados por dominio (`auth`, `chat`, `compliance`, `documents`, `evidence`, `risk`).
- **`services/`**: Lógica de negocio y conectores externos.
  - `deepseek_service.py` / `ai_service.py`: Gestión de interacciones con la IA de DeepSeek.
  - Lógica para ISO compliance analyzer, parsing, etc.
- **`models/`**: Definición de modelos SQLAlchemy (ORM).
- **`repositories/`**: Abstracción del acceso a datos.

## 🔄 Flujo de Datos

1. **Interacción del Usuario:** El usuario interactúa con la UI (React). Ejemplo: Iniciar un análisis de riesgos o conversar con la IA en el Chat.
2. **Petición HTTP (Frontend):** Se invoca una función desde `api.js` que realiza una petición HTTP/JSON hacia FastAPI (incluyendo headers de autenticación si es requerido).
3. **Validación y Enrutamiento (FastAPI):** La petición es procesada en el router correspondiente. Pydantic se encarga de validar los payloads y arrojar un Error HTTP 422 si la estructura no es la esperada.
4. **Capa de Servicios y BD:**
   - FastAPI invoca a los servicios (`services/`), los cuales interactúan asíncronamente con PostgreSQL a través de SQLAlchemy.
   - En caso de requerir la IA, se consume la API externa de DeepSeek de forma asíncrona.
5. **Respuesta (JSON):** El servidor retorna la información procesada al frontend, que finalmente actualiza la vista.

## 🚀 Estado Actual del Proyecto
- **Implementado y Operativo:** 
  - Dashboard central.
  - Exportador de reportes en PDF.
  - Módulo de Chat interactivo con IA y 50 prompts expertos.
  - Pantalla de Gap Analysis conectada a la base de datos (con visualización de controles ISO).
