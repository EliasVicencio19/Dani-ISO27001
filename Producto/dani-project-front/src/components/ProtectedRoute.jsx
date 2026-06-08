// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRoles && !requiredRoles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};