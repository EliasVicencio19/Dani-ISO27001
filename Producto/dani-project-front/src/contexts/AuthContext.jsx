// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

    const endpoint = isRegistering 
      ? 'http://localhost:8000/api/auth/register' 
      : 'http://localhost:8000/api/auth/login';

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

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔥 SOLO PARA LOGIN: Guardar usuario y token
        // 🔥 PARA REGISTRO: NO guardar nada, solo retornar éxito
        if (!isRegistering) {
          const userData = {
            id: data.user_id,
            email: data.email,
            name: data.name || name,
            token: data.access_token
          };

          setUser(userData);
          setToken(data.access_token);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return { success: true, data };
      } else {
        let errorMessage = 'Error de autenticación';
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => 
              `${err.loc?.join('.') || 'field'}: ${err.msg}`
            ).join(', ');
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}