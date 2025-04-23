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

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'login-success') {
                const { sessionId, code, state } = event.data;
                console.log('Login recebido da aba externa:');
                console.log('Session ID:', sessionId);
                console.log('Code:', code);
                console.log('State:', state);

                localStorage.setItem('code', code);
                localStorage.setItem('state', state);

                const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
                navigate(redirectPath);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

    const handleLogin = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        const raw = JSON.stringify({
            redirectUrl: 'http://34.10.196.166:3000/auth/callback',
        });

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        try {
            const response = await fetch('http://34.10.196.166:3000/auth/login', requestOptions);
            const result = await response.json(); // ← aqui a gente faz o parse
            const { sessionId, loginUrl } = result;

            console.log('Abrindo login em:', loginUrl);
            console.log("SessionID:", sessionId)

            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('redirectAfterLogin', '/dashboard');

            window.open(loginUrl, '_blank', 'width=600,height=600');
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
