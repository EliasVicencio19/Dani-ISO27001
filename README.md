<img width="300" height="300" alt="dani logo" src="https://github.com/user-attachments/assets/7722c9bc-319d-47e5-be7a-07f332b0db00" />


# 🛡️ DANI — Governance, Risk & Compliance (GRC) Platform

> **Plataforma inteligente de cumplimiento ISO 27001:2022** diseñada para humanizar la ciberseguridad, automatizar el proceso de certificación y devolver tiempo valioso a los equipos de seguridad.

---

## 📋 Tabla de Contenidos

* [Descripción General](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-descripci%C3%B3n-general)
* [El Problema que Resuelve](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-el-problema-que-resuelve)
* [Características Principales](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-caracter%C3%ADsticas-principales)
* [Stack Tecnológico](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#%EF%B8%8F-stack-tecnol%C3%B3gico)
* [Arquitectura del Sistema](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#%EF%B8%8F-arquitectura-del-sistema)
* [Módulos de la Plataforma](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-m%C3%B3dulos-de-la-plataforma)
* [Diseño UX/UI](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-dise%C3%B1o-uxui)
* [Instalación y Configuración](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-instalaci%C3%B3n-y-configuraci%C3%B3n)
* [Estructura del Proyecto](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-estructura-del-proyecto)
* [Plan de Desarrollo](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-plan-de-desarrollo)
* [Equipo y Roles](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-equipo-y-roles)
* [Contexto: Ecosistema Alloxentric](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-contexto-ecosistema-alloxentric)
* [Contribución](https://claude.ai/chat/1904a889-1efe-4063-bde4-1a77bd4535f5#-contribuci%C3%B3n)

---

## 📌 Descripción General

**DANI** es una plataforma SaaS de cumplimiento normativo que centraliza, automatiza y visualiza el estado de cumplimiento ISO 27001 en tiempo real. Forma parte del ecosistema de automatización inteligente de  **Alloxentric IA** , empresa cuya misión es liberar el potencial humano de tareas mecánicas y repetitivas.

La plataforma integra un asistente de IA (Dani AI) que actúa como mentor dentro del sistema, ayudando a los equipos de seguridad a redactar políticas, interpretar controles técnicos complejos y gestionar evidencias de forma autónoma — sin necesidad de ser consultores expertos.

> **Objetivo clave:** Reducir el tiempo de implementación de ISO 27001 en un  **60%** , transformando un proceso burocrático y agotador en un flujo de trabajo inteligente, colaborativo y auditable.

---

## 🔍 El Problema que Resuelve

La certificación ISO 27001 ha sido históricamente un proceso árido:

* 📁 Carpetas infinitas de documentos desconectados
* 📊 Hojas de cálculo confusas y propensas a errores
* 😓 "Fatiga de cumplimiento" en los equipos de tecnología
* ⏰ Auditorías de último minuto llenas de estrés
* 🔍 Falta de visibilidad en tiempo real del estado de cumplimiento

DANI convierte este laberinto en un proceso transparente, automatizado y colaborativo.

---

## ✨ Características Principales

| Funcionalidad                              | Descripción                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| 📊**Dashboard en Tiempo Real**       | Health Score visual del cumplimiento, KPIs y alertas de integración     |
| 🔍**Gap Analysis Inteligente**       | Diagnóstico inicial con formato wizard en lenguaje natural              |
| 📄**Generador de Documentos con IA** | Redacción asistida de políticas y procedimientos alineados a ISO 27001 |
| ⚠️**Mapa de Riesgos Dinámico**    | Visualización matricial de riesgos con controles sugeridos              |
| 🗄️**Centro de Evidencias**         | Recolección automática desde sistemas conectados (AWS, etc.)           |
| 📁**Gestor Documental**              | Control de versiones y firmas digitales de políticas                    |
| 🔒**Audit Room**                     | Vista de solo lectura con búsqueda semántica para auditores externos   |
| 🤖**Dani AI**                        | Asistente de IA integrado para soporte contextual en tiempo real         |
| 🌐**Multiidioma (i18n)**             | Soporte nativo en Español, Inglés y Portugués                         |
| 🌙**Dark/Light Mode**                | Temas visuales con variables CSS y soporte de alto contraste             |
| ⌨️**Command Palette**              | Navegación rápida con atajo `Cmd+K`                                  |
| 👥**RBAC Granular**                  | Control de acceso por roles: Admin, Auditor, Técnico, Consulta          |

---

## 🛠️ Stack Tecnológico

### Frontend

```
Framework:        React 18 + TypeScript + Vite
State Management: Zustand + React Query
UI Components:    Lucide React (iconografía)
Estilos:          CSS Custom Properties (tokens de diseño)
i18n:             Sistema de traducciones dinámico (ES / EN / PT)
```

### Backend

```
Runtime:          Node.js 20 LTS con TypeScript
Framework:        Fastify (alto rendimiento)
Base de Datos:    PostgreSQL 16 + pgvector (embeddings)
Cache:            Redis (sesiones, rate limiting, colas)
ORM:              Prisma con migraciones automáticas
Queue:            BullMQ (generación asíncrona de documentos)
```

### Inteligencia Artificial

```
LLM:              OpenAI GPT-4 / Anthropic Claude via LangChain
Vector Store:     Pinecone o pgvector (RAG - Retrieval Augmented Generation)
```

### Infraestructura

```
Cloud:            AWS (S3, Lambda, SQS, Bedrock opcional)
Seguridad:        JWT con claims RBAC, 2FA
Arquitectura:     Multi-tenancy con aislamiento lógico por client_id
```

---

## 🏗️ Arquitectura del Sistema

### Multi-Tenancy

La plataforma opera como SaaS con  **aislamiento lógico** : la infraestructura es compartida, pero los datos y configuraciones de cada organización están estrictamente particionados mediante un `client_id` único en cada transacción de base de datos y llamada a API.

### Feature Gating (Control de Acceso Comercial)

Un middleware de backend evalúa el **Tier comercial** del cliente antes de resolver solicitudes. Las funcionalidades premium (Dani AI, módulos avanzados) retornan `403 Forbidden` o `402 Payment Required` si el plan no las contempla. El frontend reacciona dinámicamente deshabilitando componentes no disponibles.

### RBAC (Control de Acceso Basado en Roles)

Los tokens JWT transportan claims de permisos granulares (ej. `write:vulnerabilities`), permitiendo decisiones de autorización tanto en backend como en frontend, sin depender solo del estado de autenticación.

---

## 📦 Módulos de la Plataforma

### 1. 📊 Dashboard — Centro de Mando

Responde en segundos a: *¿Estamos listos para la auditoría?*

* **Health Score:** Gráfico circular con porcentaje de preparación
* **Controles:** Barra de progreso (ej. 92/114 controles implementados)
* **Acciones Pendientes:** Lista priorizada con fechas límite
* **Alertas:** Notificaciones de fallos en recolección de evidencias
* **Timeline:** Línea de tiempo hacia la fecha de auditoría

### 2. 🔍 Gap Analysis — Diagnóstico Inteligente

* Formato **wizard paso a paso** con preguntas en lenguaje natural
* Genera automáticamente el borrador del **SOA (Statement of Applicability)**
* Barra lateral dinámica que muestra el impacto de cada respuesta en el alcance

### 3. 📝 Doc Generator — Generador de Documentos

* Redacción asistida por IA de políticas y procedimientos ISO 27001
* Plantillas alineadas a la norma con control de versiones
* Flujo de aprobación y firma digital integrado

### 4. ⚠️ Risk Map — Mapa de Riesgos

* Visualización en **matriz** o **lista**
* Risk Score calculado por probabilidad × impacto
* Controles sugeridos automáticamente por Dani AI

### 5. 🗄️ Evidence Center — Centro de Evidencias

* **Conectores automáticos** con entornos cloud (AWS, etc.)
* Carga manual de evidencias con drag & drop
* Métricas: total de evidencias, auto-recolectadas vs. manuales

### 6. 📁 Document Manager — Gestor Documental

* Control de estado: Aprobado / En Revisión / Borrador
* Historial de versiones y firmas digitales
* Búsqueda semántica con IA

### 7. 🔒 Audit Room — Sala de Auditoría

* Vista de **solo lectura** exclusiva para auditores externos
* Búsqueda semántica potenciada por IA
* Descarga de **Audit Pack** completo

### 8. 🤖 Dani AI — Asistente Inteligente

* Procesamiento de lenguaje natural para soporte contextual
* Ayuda a redactar políticas en lenguaje accesible
* Explica controles técnicos complejos sin jerga especializada

---

## 🎨 Diseño UX/UI

### Principios de Diseño

* **Confianza y Claridad:** Interfaz limpia, tipografía sans-serif (Inter/Roboto), alto uso de espacio en blanco
* **Automatización Visible:** Indicadores de sincronización en tiempo real
* **Accesibilidad:** Cumplimiento de estándares internacionales de contraste

### Paleta de Colores Semántica

| Color                        | Significado                           |
| ---------------------------- | ------------------------------------- |
| 🔵 Azul Marino / Gris Oscuro | Elementos estructurales y navegación |
| 🟢 Verde Esmeralda           | Cumplimiento / Listo para auditar     |
| 🟡 Ámbar / Naranja          | Atención requerida / En progreso     |
| 🔴 Rojo Suave                | No cumplimiento / Riesgo crítico     |

### Arquitectura de Información (Sidebar)

El flujo de navegación sigue el ciclo de mejora continua  **PDCA** :

1. Dashboard
2. Gap Analysis
3. Generador de Documentos
4. Mapa de Riesgos
5. Centro de Evidencias
6. Gestor Documental
7. Audit Room
8. Portal de Empleados
9. Configuración & Usuarios

---

## 🚀 Instalación y Configuración

> ⚠️ **Nota:** Este documento describe la arquitectura de referencia. El Manual de Deployment detallado (dependencias, variables de entorno, configuración de servidores) debe ser completado como parte de los entregables del proyecto.

### Requisitos del Sistema (Cliente)

| Componente  | Mínimo                             | Recomendado                  |
| ----------- | ----------------------------------- | ---------------------------- |
| Navegador   | Chrome 90+, Firefox 88+, Safari 14+ | Chrome/Edge última versión |
| Resolución | 1280 × 720 px                      | 1920 × 1080 px              |
| Conexión   | 5 Mbps                              | 25 Mbps                      |
| JavaScript  | Habilitado                          | Habilitado                   |

### Variables de Entorno Requeridas (Backend)

```env
# Base de Datos
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PINECONE_API_KEY=...

# Autenticación
JWT_SECRET=...
JWT_EXPIRES_IN=24h

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alloxentric/dani-platform.git
cd dani-platform

# 2. Instalar dependencias (Frontend)
cd frontend
npm install

# 3. Instalar dependencias (Backend)
cd ../backend
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 5. Ejecutar migraciones de base de datos
npx prisma migrate deploy

# 6. Iniciar en desarrollo
npm run dev
```

---

## 📁 Estructura del Proyecto

```
dani-platform/
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React reutilizables
│   │   │   ├── Dashboard/
│   │   │   ├── GapAnalysis/
│   │   │   ├── DocGenerator/
│   │   │   ├── RiskMap/
│   │   │   ├── EvidenceCenter/
│   │   │   ├── AuditRoom/
│   │   │   └── shared/
│   │   ├── contexts/           # ThemeContext, AuthContext
│   │   ├── hooks/              # Custom hooks
│   │   ├── i18n/               # Traducciones (ES, EN, PT)
│   │   ├── store/              # Zustand stores
│   │   └── types/              # Definiciones TypeScript
│   └── public/
├── backend/
│   ├── src/
│   │   ├── routes/             # Endpoints de la API
│   │   ├── middleware/         # Auth, RBAC, Feature Gating
│   │   ├── services/           # Lógica de negocio
│   │   ├── agents/             # Agentes IA (LangChain)
│   │   └── prisma/             # Schema y migraciones
│   └── tests/
├── docs/
│   ├── Especificación de Proyecto.docx
│   ├── Documento de Diseño UX.docx
│   ├── Plan de Desarrollo v2.docx
│   ├── Manual de Usuario v3.docx
│   └── Estándares Transversales.docx
└── wireframes/
    └── dani_platform_wireframe.html
```

---

## 📅 Plan de Desarrollo

El proyecto sigue metodología **Scrum** con sprints de 2 semanas.

| Métrica                | Valor           |
| ----------------------- | --------------- |
| Total de Sprints        | 10 (20 semanas) |
| Story Points Totales    | 420 SP          |
| Velocidad Estimada      | 42 SP/sprint    |
| Tickets Backend         | 38              |
| Tickets Frontend        | 36              |
| **Total Tickets** | **74**    |

### Módulos Críticos en Desarrollo Activo

* [ ] **Centro de Evidencias** — refinamiento de interacciones UX
* [ ] **Audit Room** — completar funcionalidades avanzadas
* [ ] **Dark Mode** — soporte completo en todos los componentes
* [ ] **i18n** — validación de multiidioma en todos los módulos
* [ ] **Manual de Deployment** — documentación técnica de producción
* [ ] **Manual de Usuario** — capturas reales de pantalla (v3 actualizado)

---

## 👥 Equipo y Roles

| Rol                                     | Especialización                 | Responsabilidades                         |
| --------------------------------------- | ------------------------------- | ----------------------------------------- |
| Backend Junior (Elías Vicencio)         | Node.js, PostgreSQL, LLM APIs   | Arquitectura, Auth, Core APIs, Agentes IA |
| Lider de proyecto (Jordy Mondaca)       | Node.js, MongoDB, Integraciones | Conectores, Evidencias, Reportes          |
| Frontend Junior (Génesis Valdebeito)    | React, CSS, Accesibilidad       | Pantallas, Formularios, i18n, a11y        |

---

## 🏢 Contexto: Ecosistema Alloxentric

DANI es un componente del ecosistema de automatización inteligente de  **Alloxentric IA** . La plataforma se conecta mediante APIs con entornos cloud y sistemas internos para recolectar evidencias de seguridad de forma automática, y utiliza los flujos de comunicación proactiva de Alloxentric para alertar a responsables cuando un riesgo cambia de nivel o un documento crítico necesita revisión.

> *"Cada proceso que logramos automatizar con éxito es tiempo que le devolvemos a un trabajador para realizar tareas con mayor propósito."* — Filosofía Alloxentric

---

## 🤝 Contribución

Este proyecto es parte del programa de formación técnica de Alloxentric. Los estudiantes asignados deben:

1. **Perfeccionar** el código base hacia una versión de producción estable
2. **Actualizar** el Manual de Usuario con capturas reales de pantalla
3. **Completar** el Manual de Deployment técnico
4. **Documentar** el Debug Log con desafíos encontrados y soluciones
5. **Validar** el impacto cuantitativo de la automatización implementada

---

## 📄 Licencia

Proyecto propietario de  **Alloxentric IA** . Uso interno y educativo bajo los términos acordados en el programa de transferencia tecnológica.

---

<div align="center">
**DANI Platform** · Desarrollado por Alloxentric IA

*Humanizando la ciberseguridad, un control a la vez.*

</div>
