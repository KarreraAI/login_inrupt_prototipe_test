import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    const code = localStorage.getItem('code');
    const state = localStorage.getItem('state');

    if (sessionId && code && state) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleLogin = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      redirectUrl: window.location.origin + '/auth/callback',
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    try {
      const response = await fetch('/api/auth/login', requestOptions);
      const result = await response.json();
      const { sessionId, loginUrl } = result;

      console.log('Redirecionando para login em:', loginUrl);
      console.log('SessionID:', sessionId);

      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('redirectAfterLogin', '/dashboard');

      window.location.href = loginUrl;
    } catch (error) {
      console.error('Erro ao iniciar o login:', error);
    }
  };

  return (
    <div className="container">
      <h1>Bem-vindo ao App</h1>
      <button onClick={handleLogin}>Login com sistema externo</button>
    </div>
  );
};
