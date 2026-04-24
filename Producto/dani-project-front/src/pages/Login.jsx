import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Aquí llama al backend de FastAPI de Elías
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.token); 
      } else {
        setError('Correo o contraseña incorrectos.');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. ¿Está encendido el backend?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            DANI Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Panel de control ISO 27001
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center font-bold bg-red-100 p-2 rounded">{error}</div>}

          <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
            {isLoading ? 'Conectando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;