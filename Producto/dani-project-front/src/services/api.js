// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
    throw new Error(error.detail || 'Error en la solicitud');
  }

  return response.json();
}

// Autenticación
export const authAPI = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getProfile: () => apiRequest('/auth/profile'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
  getRecentRisks: (limit = 5) => apiRequest(`/risks/?limit=${limit}`),
  getRiskSummary: () => apiRequest('/risks/summary'),
};

// Riesgos
export const riskAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/risks/${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/risks/${id}`),
  create: (data) => apiRequest('/risks/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/risks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/risks/${id}`, {
    method: 'DELETE'
  }),
  getStats: () => apiRequest('/risks/statistics'),
};

// Documentos (para el DocGenerator)
export const documentsAPI = {
  generateChapter: (chapterId, context) => apiRequest('/documents/generate', {
    method: 'POST',
    body: JSON.stringify({ chapter_id: chapterId, context })
  }),
  saveDocument: (chapterId, content) => apiRequest(`/documents/${chapterId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  }),
  getDocument: (chapterId) => apiRequest(`/documents/${chapterId}`),
};

// Evidencias
export const evidenceAPI = {
  getAll: () => apiRequest('/evidence/'),
  upload: (file, controlId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('control_id', controlId);
    
    return fetch(`${API_BASE_URL}/evidence/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    }).then(res => res.json());
  },
  getByControl: (controlId) => apiRequest(`/evidence/control/${controlId}`),
};

// Health check
export const healthAPI = {
  check: () => fetch('http://localhost:8000/health').then(res => res.json())
};

export default apiRequest;