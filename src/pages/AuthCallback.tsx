import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const iss = params.get('iss');

    const sessionId = localStorage.getItem('sessionId');

    if (code && state && iss && sessionId) {
      const postCallback = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('session-id', localStorage.getItem('sessionId') || '');

        const raw = JSON.stringify({
          code,
          state,
          iss,
        });

        const requestOptions: RequestInit = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        };

        try {
          const response = await fetch("/api/auth/callback", requestOptions);
          console.log("Dados recebidos do servidor:", response);

          // Salva os dados
          localStorage.setItem('code', code);
          localStorage.setItem('state', state);
          localStorage.setItem('iss', iss);

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
