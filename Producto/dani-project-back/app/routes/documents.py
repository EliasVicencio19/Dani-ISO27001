# app/routes/documents.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/")
async def get_all_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Obtener todos los documentos"""
    return {
        "message": "Endpoint de documentos",
        "documents": [],
        "total": 0
    }

from app.services.ai_service import AIService
from fastapi import Body

ai_service = AIService()

@router.post("/generate/{doc_type}")
async def generate_document(
    doc_type: str,
    prompt_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Generar un documento usando IA"""
    title = prompt_data.get("title", "")
    chapter_number = prompt_data.get("chapter_number", "")
    
    prompt = f"""Actúa como un Consultor Lead Implementer y Auditor Líder de ISO 27001 con 20 años de experiencia.
Se te ha asignado redactar un borrador extenso, exhaustivo y listo para producción del 'Capítulo {chapter_number}: {title}' para el Manual del Sistema de Gestión de Seguridad de la Información (SGSI).

Tu objetivo es generar un documento que sea TAN COMPLETO que el cliente solo tenga que rellenar los datos de su empresa. No hagas un resumen corto; redacta políticas, directrices, flujos y responsabilidades reales. Usa marcadores como [NOMBRE_EMPRESA] para los datos personalizables.

Estructura obligatoria (en Markdown):
# {chapter_number}. {title}

## Propósito y Objetivos
(Redacta de manera profesional y extensa el por qué este capítulo es crítico para el SGSI y qué se busca proteger o gestionar).

## Alcance y Aplicabilidad
(Detalla exhaustivamente a quiénes aplica esta política, en qué sistemas, y qué excepciones existen. Sé realista).

## Directrices y Políticas Normativas
(Desarrolla en profundidad los requisitos de la norma ISO 27001 para este capítulo. Inventa sub-cláusulas realistas, ejemplos de métricas, reglas de negocio y controles técnicos/administrativos que un auditor esperaría ver).

## Roles y Responsabilidades
(Crea una matriz o listado detallado de qué hace la Alta Dirección, el CISO, RRHH, TI y los empleados generales en el contexto de este capítulo).

## Registros y Evidencias
(Lista exacta de qué artefactos documentales se deben generar para demostrar cumplimiento).

IMPORTANTE: Escribe al menos 800 palabras. El tono debe ser altamente corporativo, directivo y riguroso."""
    
    try:
        content = await ai_service.chat(prompt)
    except Exception as e:
        content = f"Error conectando con la IA: {str(e)}"
        
    return {
        "message": f"Documento {doc_type} generado",
        "content": content
    }