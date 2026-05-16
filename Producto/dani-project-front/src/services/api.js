// src/services/api.js
// Configuración centralizada de la API

// 🔥 CAMBIA ESTO SEGÚN EL ENTORNO
// Para PRODUCCIÓN (Vercel):
export const API_URL = 'https://dani-iso27001-backend.onrender.com';

// Para DESARROLLO LOCAL (comenta la de arriba y descomenta esta):
// export const API_URL = 'http://localhost:8000';

// Función helper para hacer peticiones autenticadas
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

// Endpoints específicos
export const endpoints = {
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,
  verify: `${API_URL}/api/auth/verify`,
  me: `${API_URL}/api/auth/me`,
  compliance: `${API_URL}/api/compliance`,
  controls: `${API_URL}/api/compliance/controls`,
  statistics: `${API_URL}/api/compliance/statistics`,
};