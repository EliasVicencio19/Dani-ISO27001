# Descripción de Arquitectura - DANI GRC Platform
## Resumen Ejecutivo
DANI es una plataforma de **Gobernanza, Riesgo y Cumplimiento (GRC)** que utiliza inteligencia artificial para automatizar la gestión de evidencias, evaluación de riesgos y generación de documentación de cumplimiento.

---

## Componentes Principales
### 1. Usuarios del Sistema
La plataforma soporta tres tipos de usuarios con roles diferenciados:

- **Auditor**: Revisa evidencias y valida el cumplimiento normativo
- **Administrador**: Gestiona configuraciones, usuarios y políticas del sistema
- **Empleado**: Carga evidencias y responde a solicitudes de cumplimiento
---

### 2. Capa de Presentación (Frontend)
| Componente | Tecnología | Función |
| ----- | ----- | ----- |
| Hosting | Vercel | Despliegue y CDN para la aplicación web |
| Interfaz | React | Aplicación web interactiva para todos los usuarios |
---

### 3. Capa de Aplicación (Backend)
#### API Principal
- **FastAPI**: Framework Python de alto rendimiento que expone los endpoints REST
#### Microservicios
| Servicio | Responsabilidad |
| ----- | ----- |
| **Auth Service** | Autenticación, autorización y gestión de sesiones |
| **Risk Service** | Evaluación y monitoreo de riesgos organizacionales |
| **Evidence Service** | Gestión del ciclo de vida de evidencias de cumplimiento |
| **Doc Generator** | Generación automática de reportes y documentación |
#### Cola de Tareas
- **BullMQ**: Procesamiento asíncrono de tareas pesadas (generación de documentos, análisis AI)
---

### 4. Capa de Inteligencia Artificial
Esta capa potencia las capacidades de automatización:

| Componente | Función |
| ----- | ----- |
| **LangChain** | Orquestación de flujos de IA y encadenamiento de prompts |
| **OpenAI** | Modelo de lenguaje para generación de contenido y análisis |
| **Vector Store** | Base de datos vectorial para búsqueda semántica (RAG) |
**Caso de uso principal**: Generación automática de respuestas a cuestionarios de cumplimiento basándose en evidencias históricas.

---

### 5. Capa de Datos
| Componente | Uso |
| ----- | ----- |
| **PostgreSQL** | Base de datos principal (usuarios, evidencias, riesgos, sesiones AI) |
| **Redis** | Caché de sesiones y datos de autenticación para alta velocidad |
---

### 6. Integraciones con Google Cloud Platform
| Servicio GCP | Función en DANI |
| ----- | ----- |
| **Cloud Storage** | Almacenamiento de archivos de evidencia (PDFs, imágenes, documentos) |
| **Cloud Functions** | Recolección automática de evidencias desde fuentes externas |
| **Pub/Sub** | Mensajería asíncrona entre funciones y servicios |
---

## Flujo de Datos Principal
```
Usuario → React App → FastAPI → Servicios Backend
                        ↓
                Evidence Service
                        ↓
      ┌─────────────────┼─────────────────┐
      ↓                 ↓                 ↓
Cloud Storage     PostgreSQL        Doc Generator
                                         ↓
                                      BullMQ
                                         ↓
                                LangChain + OpenAI
                                         ↓
                                Documento Generado
```
---

## Decisiones Arquitectónicas Clave
1. **Separación de servicios**: Cada dominio (auth, riesgos, evidencias) tiene su propio servicio, facilitando escalabilidad independiente
2. **Procesamiento asíncrono**: Las tareas de IA se ejecutan en cola (BullMQ) para no bloquear la experiencia del usuario
3. **RAG (Retrieval-Augmented Generation)**: El Vector Store permite que la IA responda basándose en documentos reales de la organización
4. **Infraestructura híbrida**: Frontend en Vercel + integraciones serverless en GCP para optimizar costos y rendimiento
---

## Beneficios para el Cliente
- **Reducción de tiempo**: Automatización de tareas manuales de cumplimiento
- **Consistencia**: Respuestas generadas por IA basadas en evidencia real
- **Escalabilidad**: Arquitectura preparada para crecer con la organización
- **Seguridad**: Capas separadas con autenticación centralizada


