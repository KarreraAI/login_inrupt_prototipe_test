import { useEffect, useState } from 'react';

export const LoginMock = () => {
  const [code, setCode] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const stateParam = params.get('state');

    if (codeParam && stateParam) {
      setCode(codeParam);
      setState(stateParam);

      // Simula envio automático à aba principal
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'login-success',
            code: codeParam,
            state: stateParam,
          },
          window.location.origin
        );
        console.log('Login automático enviado via postMessage');
        window.close();
      }
    }
  }, []);

  const handleSendToParent = () => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'login-success',
          code,
          state,
        },
        window.location.origin
      );
      console.log('Token enviado para aba principal');
      window.close();
    }
  };

  return (
    <div className="container">
      <h2>Simulação de Login</h2>

      {code && state ? (
        <div>
          <p><strong>Code:</strong> {code}</p>
          <p><strong>State:</strong> {state}</p>
          <button onClick={handleSendToParent}>Concluir login</button>
        </div>
      ) : (
        <p>Aguardando parâmetros da URL...</p>
      )}
    </div>
  );
};
