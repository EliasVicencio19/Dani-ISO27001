// src/services/api.js - CORREGIDO
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
  verify: () => apiRequest('/auth/verify'),
};

// ✅ Dashboard (endpoint CORRECTO)
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

// ✅ Riesgos (endpoint CORRECTO)
export const riskAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/risks${query ? `?${query}` : ''}`);
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
  getStats: () => apiRequest('/risks/statistics'),
  getHighPriority: () => apiRequest('/risks/high-priority'),
};

// 📦 Pendiente - cuando creemos el backend
export const documentsAPI = {
  generateChapter: (chapterId, title) => apiRequest('/documents/generate', {
    method: 'POST',
    body: JSON.stringify({ chapter_id: chapterId, title })
  }),
};

export const chatAPI = {
  sendMessage: (message) => apiRequest('/chat/', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),
};

export default apiRequest;