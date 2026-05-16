// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ✅ CONFIGURACIÓN ÚNICA - CAMBIA SOLO ESTA LÍNEA SEGÚN TU ENTORNO
// ================================================================
// Para PRODUCCIÓN (Vercel):
const API_URL = 'https://dani-iso27001-backend.onrender.com';
// Para DESARROLLO LOCAL (descomenta esta y comenta la de arriba):
// const API_URL = 'http://localhost:8000';
// ================================================================

console.log('🔍 [AuthContext] API_URL configurada:', API_URL);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (email, password, isRegistering, name) => {
    setIsLoading(true);
    setError(null);

    // 🔥 CONSTRUIR ENDPOINT CON API_URL
    const endpoint = isRegistering 
      ? `${API_URL}/api/auth/register`
      : `${API_URL}/api/auth/login`;

    console.log('🔍 [AuthContext] Llamando a endpoint:', endpoint);
    console.log('🔍 [AuthContext] isRegistering:', isRegistering);

    let payload;
    if (isRegistering) {
      payload = {
        name: name,
        email: email,
        password: password
      };
    } else {
      payload = {
        email: email,
        password: password
      };
    }

    console.log('🔍 [AuthContext] Payload:', { ...payload, password: '***' });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      console.log('🔍 [AuthContext] Response status:', response.status);

      const data = await response.json();
      console.log('🔍 [AuthContext] Response data:', data);

      if (response.ok) {
        // SOLO PARA LOGIN: Guardar usuario y token
        if (!isRegistering) {
          const userData = {
            id: data.user_id || data.id,
            email: email,
            name: data.name || name || email.split('@')[0],
            token: data.access_token
          };

          setUser(userData);
          setToken(data.access_token);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ [AuthContext] Login exitoso, usuario guardado');
        } else {
          console.log('✅ [AuthContext] Registro exitoso');
        }
        
        return { success: true, data };
      } else {
        // Manejo de errores
        let errorMessage = 'Error de autenticación';
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => 
              `${err.loc?.join('.') || 'campo'}: ${err.msg}`
            ).join(', ');
          } else if (typeof data.detail === 'object') {
            errorMessage = JSON.stringify(data.detail);
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('❌ [AuthContext] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🔍 [AuthContext] Usuario desconectado');
  }, []);

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user || !!localStorage.getItem('token')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}