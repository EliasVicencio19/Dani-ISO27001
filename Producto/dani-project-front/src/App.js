import React, { useState } from 'react';
import Login from './pages/Login';
import DaniPlatform from './dani-platform-v3'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (userToken) => {
    setToken(userToken);
    setIsAuthenticated(true);
  };

  // Si no está autenticado, muestra el componente Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si se loguea bien, muestra tu diseño principal
  return <DaniPlatform token={token} />;
}

export default App;