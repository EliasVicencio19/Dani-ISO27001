// src/services/api.js - ACTUALIZADO CON SWAGGER Y CHAT
const API_BASE_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Si enviamos FormData (archivos), el navegador debe calcular el Content-Type automáticamente
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
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

// ✅ Autenticación
export const authAPI = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (name, email, password) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  }),
  verify: () => apiRequest('/auth/verify', { method: 'POST' }),
};

// ✅ Dashboard
export const dashboardAPI = {
  getSummary: () => apiRequest('/dashboard/summary'),
  getRecentActivity: (limit = 10) => apiRequest(`/dashboard/recent-activity?limit=${limit}`),
};

// ✅ Usuarios
export const userAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/users/${id}`),
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// ✅ Riesgos (Conectado a Swagger)
export const riskAPI = {
  getAll: () => apiRequest('/risks/'),
  create: (data) => apiRequest('/risks/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getStats: () => apiRequest('/risks/statistics'),
  getHighPriority: () => apiRequest('/risks/high-priority'),
  updateStatus: (id, status) => apiRequest(`/risks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  analyzeWithAI: (id) => apiRequest(`/risks/${id}/analyze`, { method: 'POST' })
};

// ✅ Evidencia (Nuevo de Swagger)
export const evidenceAPI = {
  getAll: () => apiRequest('/evidence/'),
  getById: (id) => apiRequest(`/evidence/${id}`),
  upload: (formData) => apiRequest('/evidence/upload', {
    method: 'POST',
    body: formData
  })
};

// ✅ Cumplimiento ISO 27001
export const complianceAPI = {
  getControls: () => apiRequest('/compliance/controls'),
  getStatistics: () => apiRequest('/compliance/statistics'),
  fullAssessment: (data) => apiRequest('/compliance/full-assessment', { 
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ✅ Documentos
export const documentsAPI = {
  getAll: () => apiRequest('/documents/'),
  generateDocument: (docType, promptData) => apiRequest(`/documents/generate/${docType}`, {
    method: 'POST',
    body: JSON.stringify(promptData)
  }),
};

// ✅ Chat IA (CORREGIDO Y EXPORTADO CORRECTAMENTE)
export const chatAPI = {
  sendMessage: (textToSend) => apiRequest('/chat/', {
    method: 'POST',
    body: JSON.stringify({
      message: textToSend // Se envía estructurado para evitar el error 422 de FastAPI
    })
  })
};