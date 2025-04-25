import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    // const iss = params.get('iss');
    const sessionId = localStorage.getItem('sessionId');

    if (code && state && sessionId) {
      const postCallback = async () => {
        const myHeaders = new Headers();
        myHeaders.append('session-id', sessionId);
        myHeaders.append('Content-Type', 'application/json');

        console.log("Code: ", code);
        console.log("State: ", state);

        const raw = JSON.stringify({
          code,
          state,
          "iss": 'https%3A%2F%2Flogin.inrupt.com',
        });

        const requestOptions: RequestInit = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        };

        try {
          const response = await fetch('/api/auth/callback', requestOptions);
          // const resultText = await response.text();

          // console.log('Resultado do servidor:', resultText);

          // Armazena os dados localmente
          localStorage.setItem('code', code);
          localStorage.setItem('state', state);
          localStorage.setItem('iss', 'https%3A%2F%2Flogin.inrupt.com');

          // Redireciona após sucesso
          const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error('Erro ao enviar dados para o servidor:', error);
          navigate('/', { replace: true });
        }
      };

      postCallback();
    } else {
      console.warn('Parâmetros ausentes na callback.');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return <div>Processando login... Por favor, aguarde.</div>;
};