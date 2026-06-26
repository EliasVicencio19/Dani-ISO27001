// Producto/dani-project-front/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_URL } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password, isRegistering, name) => {
    setIsLoading(true);
    setError(null);

    const endpoint = isRegistering
      ? `${API_URL}/api/auth/register`
      : `${API_URL}/api/auth/login`;

    const payload = isRegistering
      ? { name, email, password }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isRegistering) {
          const userData = {
            email: email,
            name: data.name || name,
            role: data.role || 'employee',
            token: data.access_token
          };
          setUser(userData);
          setToken(data.access_token);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return { success: true, data };
      } else {
        throw new Error(data.detail || 'Error de autenticación');
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
    isAuthenticated: !!user,
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
