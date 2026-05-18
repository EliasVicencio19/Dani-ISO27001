# 🛡️ DANI - Sistema de Gestión de Cumplimiento ISO 27001
## 📋 Documentación Técnica para la Segunda Evaluación Parcial (Taller de Programación)

**Integrantes del Equipo:**
*   **Elías Vicencio** (Desarrollo Backend, Estándares de Cumplimiento y Parser ISO)
*   **Génesis Valdebeito** (Diseño de Interfaces, Navegación y Aseguramiento de Calidad)
*   **Jordy Mondaca** (Integración de APIs, Orquestación de IA y Arquitectura de Datos)

---

## 1. 🏗️ Arquitectura de la Solución (Diseño y Flujo)

DANI es una plataforma avanzada de **Gobernanza, Riesgo y Cumplimiento (GRC)** orientada al estándar internacional **ISO/IEC 27001:2022**. La aplicación está construida sobre una arquitectura cliente-servidor desacoplada que integra Inteligencia Artificial para automatizar el análisis de brechas normativas y sugerir planes de mitigación de riesgos.

### 📊 Diagrama Arquitectónico General

El siguiente diagrama detalla cómo interactúa la capa de presentación (React + Tailwind CSS) con la capa de aplicación (FastAPI) y la capa de datos (PostgreSQL en Neon.tech + Weaviate/pgvector RAG) junto con los servicios cognitivos externos de **DeepSeek**:

```mermaid
graph TD
    %% Estilos de los nodos
    style User fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Frontend fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff
    style Backend fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style DB fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff
    style AI fill:#0f172a,stroke:#ef4444,stroke-width:2px,color:#fff

    User[👤 Usuario CISO / Auditor] -->|Interactúa / Login| Frontend[💻 React Web App <br> Vite + Tailwind CSS]
    
    subgraph Capa de Presentación
        Frontend
    end

    Frontend -->|HTTP / REST JSON + Bearer JWT| Backend[⚡ FastAPI Backend <br> Uvicorn Server]

    subgraph Capa de Aplicación (Backend)
        Backend -->|Auth Middleware| AuthService[🔐 AuthService <br> JWT / bcrypt]
        Backend -->|Lógica de Negocio| RiskService[🎯 RiskService <br> Mitigación e Impacto]
        Backend -->|Verificación Normativa| ComplianceService[🛡️ ComplianceService <br> ISO 27001:2022]
        Backend -->|Indexación RAG| EmbeddingService[🔬 EmbeddingService <br> Chunking & Text Parsing]
    end

    subgraph Capa de Datos
        AuthService -->|Persistencia de Usuarios| DB[(🐘 PostgreSQL <br> Neon.tech Cloud)]
        RiskService -->|CRUD de Riesgos| DB
        ComplianceService -->|Matriz de Controles| DB
        EmbeddingService -->|Vectores de Evidencia| DB
    end

    subgraph Capa Cognitiva (Inteligencia Artificial)
        Backend -->|Petición Async compatible con OpenAI| AI{🤖 DeepSeek AI Service <br> Groq / Llama Fallback}
        AI -.->|Sugerencias de Controles y Mitigación| Backend
    end
```

---

## 2. 🐘 Estructura y Modelos de Base de Datos

La persistencia de datos está implementada sobre **PostgreSQL (Neon.tech)** administrada de forma asíncrona mediante **SQLAlchemy 2.0**. La base de datos contiene un motor de búsqueda semántica (RAG) nativo o mediante vector flotante.

### 🧬 Modelos Clave de la Base de Datos

```mermaid
erDiagram
    users {
        string id PK
        string email UK
        string full_name
        string hashed_password
        enum role
        boolean is_active
        datetime created_at
        datetime last_login
    }
    risks {
        string id PK
        string title
        text description
        enum category
        integer likelihood
        integer impact
        enum risk_level
        enum status
        json controls
        string owner
        string created_by FK
        datetime created_at
    }
    evidences {
        string id PK
        string title
        string file_url
        string file_name
        integer file_size
        string mime_type
        enum evidence_type
        json evidence_metadata
        string risk_id FK
        datetime verified_at
    }
    evidence_chunks {
        integer id PK
        string evidence_id FK
        text content
        vector embedding
        integer chunk_index
    }
    iso_controls {
        string control_id PK
        string title
        text description
        string category
        boolean applies
        enum status
        text justification
    }

    users ||--o{ risks : "crea"
    risks ||--o{ evidences : "tiene"
    evidences ||--o{ evidence_chunks : "se particiona"
```

*   **pgvector Support:** La inicialización de la base de datos detecta dinámicamente si la extensión `vector` está activa en PostgreSQL. Si está presente, crea columnas del tipo `Vector(1536)` para almacenar fragmentos semánticos; si no, realiza un fallback transparente a `FLOAT[]` en la capa de persistencia lógica.

---

## 3. 🔐 Sistema de Registro y Login (Seguridad JWT)

La plataforma utiliza **JWT (JSON Web Tokens)** con firmas HMAC SHA-256 para la autenticación y control de accesos.

```
+------------------+         Petición POST /api/auth/register          +------------------+
|                  | ------------------------------------------------> |                  |
|                  |          (Valida email, fortaleza pass)           |                  |
|                  |                                                   |                  |
|                  |         Retorna Código 201 (Creado)               |                  |
|                  | <------------------------------------------------ |                  |
|     React        |                                                   |     FastAPI      |
|    Frontend      |         Petición POST /api/auth/login             |     Backend      |
|                  | ------------------------------------------------> |                  |
|                  |          (Verifica hash de pass con bcrypt)       |                  |
|                  |                                                   |                  |
|                  |         Retorna Access Token (JWT)                |                  |
|                  | <------------------------------------------------ |                  |
+------------------+                                                   +------------------+
         |
         | Almacena en localStorage.getItem('token')
         V
+------------------+     Petición a Endpoint Protegido (/api/users)    +------------------+
|   Llamadas API   | ------------------------------------------------> |   Middleware     |
|   con Token      |      Headers: { Authorization: Bearer JWT }       |   get_current_user|
+------------------+                                                   +------------------+
```

### 🛡️ Políticas de Seguridad de Contraseñas (Backend & Frontend)
1.  **Límite de Longitud:** Mínimo 8 caracteres.
2.  **Complejidad:** Debe contener al menos una mayúscula `[A-Z]`, una minúscula `[a-z]`, un número `[0-9]` y un carácter especial `[^A-Za-z0-9]`.
3.  **Hashing en Reposo:** Las contraseñas se encriptan con **bcrypt** mediante un factor de trabajo adaptativo para prevenir ataques de fuerza bruta y pre-computados (tablas arcoíris).

---

## 4. 📋 Mantenedores (CRUD) y Contrato de API

Hemos implementado un conjunto robusto de mantenedores RESTful para la gestión de la plataforma. A continuación se presentan las firmas de los endpoints clave:

### 👤 Módulo: Gestión de Usuarios (`/api/users`)

| Operación | Método HTTP | Ruta | Descripción | Payload de Entrada (JSON) | Respuesta Exitosa (200/201 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Crear** | `POST` | `/api/users/` | Registra un nuevo usuario en la organización | `{"full_name": "Ana", "email": "ana@dani.com", "password": "PassSpecial123!", "role": "auditor"}` | `{"message": "Usuario creado", "id": "uuid-..."}` |
| **Leer Todos**| `GET` | `/api/users/` | Retorna el listado completo de usuarios registrado | *Ninguno* | `[{"id": "...", "full_name": "Ana", "email": "..."}]` |
| **Leer Uno** | `GET` | `/api/users/{id}` | Busca un usuario en específico por su ID único | *Ninguno* | `{"id": "...", "full_name": "Ana", "role": "auditor"}` |
| **Actualizar**| `PUT` | `/api/users/{id}` | Modifica los datos del perfil o estado del usuario | `{"full_name": "Ana Silva", "role": "admin"}` | `{"message": "Usuario actualizado", "user": {...}}` |
| **Eliminar**  | `DELETE` | `/api/users/{id}` | Remueve definitivamente un usuario de la base de datos | *Ninguno* | `{"message": "Usuario eliminado exitosamente"}` |

### 🎯 Módulo: Matriz de Riesgos (`/api/risks`)

| Operación | Método HTTP | Ruta | Descripción | Payload de Entrada (JSON) | Respuesta Exitosa (200/201 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Crear** | `POST` | `/api/risks/` | Identifica y calcula la prioridad de un riesgo | `{"title": "Fuga", "description": "...", "likelihood": 4, "impact": 5, "owner": "ciso@co.com"}` | `{"id": "...", "title": "Fuga", "risk_level": "critical"}` |
| **Leer Todos**| `GET` | `/api/risks/` | Trae la lista de riesgos con filtros de nivel/estado | *Ninguno* | `[{"id": "...", "title": "Fuga", "status": "open"}]` |
| **Actualizar**| `PUT` | `/api/risks/{id}` | Edita los datos del riesgo y recalcula la criticidad | `{"likelihood": 2, "impact": 3}` | `{"id": "...", "likelihood": 2, "risk_level": "medium"}` |
| **Analizar IA**| `POST` | `/api/risks/{id}/analyze` | Genera controles recomendados mediante DeepSeek | *Ninguno* | `{"message": "Analysis complete", "data": {"analysis": "..."}}` |
| **Eliminar**  | `DELETE` | `/api/risks/{id}` | Elimina el registro de riesgo seleccionado | *Ninguno* | `{"message": "Risk deleted successfully"}` |

---

## 5. 🚀 Guía de Configuración del Entorno

### 📦 Backend (`Producto/dani-project-back`)

1.  **Requisitos:** Tener instalado Python 3.10 o superior.
2.  **Instalar dependencias necesarias:**
    ```powershell
    cd Producto/dani-project-back
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  **Configurar Variables de Entorno (`.env`):**
    ```env
    DATABASE_URL=postgresql+asyncpg://neondb_owner:password@ep-cool-water-a5.us-east-2.aws.neon.tech/neondb?ssl=require
    JWT_SECRET=super_safe_secret_key_1234!
    AI_API_KEY=groq-api-key-here
    AI_BASE_URL=https://api.groq.com/openai/v1
    AI_MODEL=llama3-8b-8192
    ```
4.  **Iniciar Servidor Local:**
    ```powershell
    python -m app.main
    ```
    El servidor levantará en `http://127.0.0.1:8000`. Puedes verificar la documentación interactiva OpenAPI en `http://127.0.0.1:8000/docs`.

### 💻 Frontend (`Producto/dani-project-front`)

1.  **Instalar dependencias y levantar el servidor de desarrollo:**
    ```powershell
    cd Producto/dani-project-front
    npm install
    npm start
    ```
    La aplicación se iniciará en `http://localhost:3000`.

---

## 6. 📅 Planificación de Plazos, Roles e Hitos

Alineados con la metodología ABP (Aprendizaje Basado en Problemas) y marcos de trabajo ágiles (Scrum), dividimos el desarrollo en los siguientes hitos:

```mermaid
gantt
    title Plan de Trabajo: Diseño y Ejecución Inicial (Experiencia 2)
    dateFormat  YYYY-MM-DD
    section Fase de Planificación y Diseño
    Modelamiento de Base de Datos (Neon.tech)   :active, des1, 2026-05-10, 3d
    Diseño de Arquitectura y Mockups Figma      :active, des2, 2026-05-11, 4d
    section Actividad 2.1 - Ejecución Inicial
    Configuración de Entorno de Desarrollo      :done, act1, 2026-05-13, 1d
    Sistema de Login e Implementación JWT       :done, act2, 2026-05-14, 3d
    Mantenedor CRUD de Usuarios (Backend/Front)  :done, act3, 2026-05-15, 3d
    Mantenedor CRUD de Riesgos (Backend/Front)   :done, act4, 2026-05-16, 2d
    Integración de Servicios de IA (DeepSeek)   :done, act5, 2026-05-17, 2d
    Entrega y Presentación de Parcial 2         :crit, active, act6, 2026-05-18, 1d
```

*   **Elías Vicencio (Backend/Parser):** Lideró el parsing de los estándares ISO, el diseño transaccional asíncrono y los controladores de FastAPI.
*   **Génesis Valdebeito (UX/QA):** Se enfocó en la responsividad de los paneles, micro-animaciones, flujos de sesión consistentes y pruebas de compatibilidad.
*   **Jordy Mondaca (Integración/IA):** Coordinó el RAG vectorial, la indexación inteligente de evidencias y la configuración dinámica del servicio DeepSeek.

---

> [!NOTE]
> **Integración Flawless:** Los endpoints CRUD de usuarios y riesgos en la interfaz de React han sido totalmente alineados con la firma del backend de FastAPI, incluyendo soporte y fallbacks automáticos para los tokens de `localStorage` y compatibilidad con las llamadas aliadas `userAPI.getAll()` y `riskAPI.analyzeWithAI()`. Todo está listo para ser ejecutado y testeado en producción o en el entorno local.
