// src/services/api.js

const API_BASE_URL = 'http://localhost:8000/api';

// Obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Función genérica para hacer requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado o inválido - cerrar sesión
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
    throw new Error(error.detail || 'Error en la solicitud');
  }

  return response.json();
}

// Endpoints del Dashboard
export const dashboardAPI = {
  getSummary: () => apiRequest('/dashboard/summary'),
  getRecentActivity: (limit = 10) => apiRequest(`/dashboard/recent-activity?limit=${limit}`),
};

// Endpoints de Riesgos
export const riskAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/risks?${query}`);
  },
  getStats: () => apiRequest('/risks/statistics'),
  getHighPriority: () => apiRequest('/risks/high-priority'),
};

export default apiRequest;