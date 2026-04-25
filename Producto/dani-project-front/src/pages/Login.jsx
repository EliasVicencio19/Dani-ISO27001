import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, UserPlus, User } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Definimos a qué ruta de Python le vamos a pegar según el modo
    const endpoint = isRegistering 
      ? 'http://localhost:8000/api/auth/register' 
      : 'http://localhost:8000/api/auth/login';

    // Si registramos, enviamos el nombre también
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
        
        if (isRegistering) {
          // Si el registro fue exitoso, lo devolvemos al Login con un mensaje verde
          setSuccess('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
          setIsRegistering(false);
          setPassword(''); // Limpiamos la contraseña por seguridad
        } else {
          // Si el login fue exitoso, lo dejamos pasar al Dashboard
          onLoginSuccess(data.token); 
        }
      } else {
        setError(isRegistering 
          ? 'Error al registrar. Es posible que el correo ya esté en uso.' 
          : 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión. El servidor de la plataforma está inaccesible.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #334155', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', transition: 'all 0.3s ease' }}>
        
        {/* Cabecera y Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
            <Shield size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido a DANI'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
            {isRegistering ? 'Registra tus datos para acceder al sistema' : 'Acceso seguro al portal de gestión ISO 27001'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Input Nombre (Solo visible en Registro) */}
          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
                Nombre Completo
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required={isRegistering} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej. Juan Pérez"
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '14px 16px 14px 44px', color: 'white', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>
          )}

          {/* Input Correo */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ciso@empresa.com"
                style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '14px 16px 14px 44px', color: 'white', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '14px 16px 14px 44px', color: 'white', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
          </div>

          {/* Mensajes de Alerta (Error o Éxito) */}
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '12px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
              {success}
            </div>
          )}

          {/* Botón Principal */}
          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontSize: '15px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Procesando...' : (
              <>
                {isRegistering ? 'Registrar Cuenta' : 'Ingresar al Dashboard'}
                {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
              </>
            )}
          </button>
        </form>

        {/* Separador y Botón para alternar vistas */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #334155', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            <button 
              onClick={toggleMode}
              type="button"
              style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, marginLeft: '8px', cursor: 'pointer', fontSize: '14px', padding: 0 }}
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;