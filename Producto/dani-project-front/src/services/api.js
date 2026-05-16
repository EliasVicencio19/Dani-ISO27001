// src/services/api.js - VERSIÓN COMPLETA (con todo lo que necesitas)
// Configuración centralizada de la API

// ============================================
// 🔥 URL BASE (SOLO CAMBIA ESTO SEGÚN ENTORNO)
// ============================================
// Para PRODUCCIÓN (Vercel):
export const API_URL = 'https://dani-iso27001-backend.onrender.com';

// Para DESARROLLO LOCAL (comenta la de arriba y descomenta esta):
// export const API_URL = 'http://localhost:8000';

// ============================================
// 📌 CHAT API
// ============================================
export const chatAPI = {
  sendMessage: async (message, token) => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return { error: error.message };
    }
  }
};

// ============================================
// 📄 DOCUMENTOS API
// ============================================
export const documentsAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/api/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  generate: async (docType, data, token) => {
    const response = await fetch(`${API_URL}/api/documents/generate/${docType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// ============================================
// 📊 COMPLIANCE API
// ============================================
export const complianceAPI = {
  getControls: async (token, category = null) => {
    const url = category 
      ? `${API_URL}/api/compliance/controls?category=${category}`
      : `${API_URL}/api/compliance/controls`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  getStatistics: async (token) => {
    const response = await fetch(`${API_URL}/api/compliance/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  assessControl: async (controlId, evidence, token) => {
    const response = await fetch(`${API_URL}/api/compliance/assess/${controlId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(evidence)
    });
    return response.json();
  },
  
  fullAssessment: async (organizationData, token) => {
    const response = await fetch(`${API_URL}/api/compliance/full-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(organizationData)
    });
    return response.json();
  }
};

// ============================================
// 🔐 AUTHENTICATION API
// ============================================
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  },
  
  verify: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  },
  
  getMe: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ============================================
// 📋 EVIDENCE API
// ============================================
export const evidenceAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/api/evidence`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  upload: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/api/evidence/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  }
};

// ============================================
// 🎯 RISK API
// ============================================
export const riskAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/api/risks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  create: async (riskData, token) => {
    const response = await fetch(`${API_URL}/api/risks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(riskData)
    });
    return response.json();
  },
  
  getStatistics: async (token) => {
    const response = await fetch(`${API_URL}/api/risks/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ============================================
// 🔧 FUNCIONES HELPER
// ============================================
export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  return response;
};

// ============================================
// 📍 ENDPOINTS (para referencia)
// ============================================
export const endpoints = {
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,
  verify: `${API_URL}/api/auth/verify`,
  me: `${API_URL}/api/auth/me`,
  compliance: `${API_URL}/api/compliance`,
  controls: `${API_URL}/api/compliance/controls`,
  statistics: `${API_URL}/api/compliance/statistics`,
  documents: `${API_URL}/api/documents`,
  evidence: `${API_URL}/api/evidence`,
  risks: `${API_URL}/api/risks`,
  chat: `${API_URL}/api/chat`,
};

// ============================================
// 🚪 EXPORT DEFAULT (para importar todo junto)
// ============================================
const api = {
  API_URL,
  chatAPI,
  documentsAPI,
  complianceAPI,
  authAPI,
  evidenceAPI,
  riskAPI,
  authFetch,
  endpoints
};

export default api;