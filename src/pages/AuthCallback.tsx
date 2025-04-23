import { useEffect } from 'react';

export const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state && window.opener) {
      // Envia os dados para a aba principal
      window.opener.postMessage(
        {
          type: 'login-success',
          code,
          state,
        },
        window.location.origin
      );
      console.log('Dados enviados para a aba principal via postMessage');

      // Fecha a janela popup após o envio
      window.close();
    }
  }, []);

  return <div>Processando login... Por favor, aguarde.</div>;
};
