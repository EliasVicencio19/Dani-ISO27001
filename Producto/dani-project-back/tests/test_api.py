"""
Tests funcionales DANI ISO 27001
Ejecutar: pytest tests/test_api.py -v
"""
import pytest
import httpx

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@dani27001.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def token():
    """Obtiene token de admin para los tests que lo requieren."""
    response = httpx.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, "No se pudo obtener token de admin"
    return response.json()["access_token"]


# ============================================================
# AUTENTICACIÓN
# ============================================================

def test_login_correcto():
    """Login con credenciales válidas retorna token."""
    response = httpx.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_credenciales_incorrectas():
    """Login con contraseña incorrecta retorna 401."""
    response = httpx.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": "wrong_password"},
    )
    assert response.status_code == 401


def test_login_usuario_inexistente():
    """Login con email que no existe retorna 401."""
    response = httpx.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "noexiste@test.com", "password": "cualquiera"},
    )
    assert response.status_code == 401


def test_acceso_sin_token():
    """Endpoint protegido sin token retorna 401 o 403."""
    response = httpx.get(f"{BASE_URL}/api/risks/")
    assert response.status_code in (401, 403)


# ============================================================
# RIESGOS
# ============================================================

def test_listar_riesgos(token):
    """Lista de riesgos retorna 200 y es una lista."""
    response = httpx.get(
        f"{BASE_URL}/api/risks/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_crear_riesgo(token):
    """Crear un riesgo retorna 200 con los datos correctos."""
    payload = {
        "title": "Test - Riesgo de prueba",
        "description": "Riesgo creado automáticamente por el plan de pruebas",
        "category": "security",
        "likelihood": 3,
        "impact": 3,
        "owner": "Equipo QA",
    }
    response = httpx.post(
        f"{BASE_URL}/api/risks/",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == payload["title"]
    assert "id" in data
    assert "risk_level" in data


def test_estadisticas_riesgos(token):
    """Estadísticas de riesgos retorna 200 con datos."""
    response = httpx.get(
        f"{BASE_URL}/api/risks/statistics",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# ============================================================
# COMPLIANCE / GAP ANALYSIS
# ============================================================

def test_listar_controles_iso(token):
    """Lista de controles ISO retorna 200 y no está vacía."""
    response = httpx.get(
        f"{BASE_URL}/api/compliance/controls",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0


def test_estadisticas_compliance(token):
    """Estadísticas de cumplimiento retorna 200."""
    response = httpx.get(
        f"{BASE_URL}/api/compliance/statistics",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


def test_exportar_soa_pdf(token):
    """Exportación SOA retorna PDF (content-type correcto)."""
    response = httpx.get(
        f"{BASE_URL}/api/compliance/soa/export",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert "application/pdf" in response.headers.get("content-type", "")


# ============================================================
# HEALTH CHECK
# ============================================================

def test_health_check():
    """El servidor responde correctamente al health check."""
    response = httpx.get(f"{BASE_URL}/health")
    assert response.status_code == 200
