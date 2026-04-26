// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password, isRegistering, name) => {
    setIsLoading(true);
    setError(null);

    const endpoint = isRegistering 
      ? 'http://localhost:8000/api/auth/register' 
      : 'http://localhost:8000/api/auth/login';

    const payload = isRegistering 
      ? { name, email, password } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!isRegistering) {
          // Login exitoso
          const userData = {
            email: email,
            token: data.access_token,
            role: 'user'
          };
          setUser(userData);
          setToken(data.access_token);
          localStorage.setItem('token', data.access_token);
        }
        // Si es registro, no hacemos login automático
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error de autenticación');
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
  }, []);

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
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