import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import io from 'socket.io-client'; // Importando o Socket.IO Client
import styles from '../styles/Login.module.css';

let socket; // Variável global para o socket

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verifica se as credenciais estão armazenadas
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername) {
      setUsername(savedUsername);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await axios.post('http://localhost:3000/login', { username, password });
        console.log(response.data); // Verifique a estrutura da resposta

        if (response.status === 200) {
            setMessage('Login bem-sucedido!');
            const token = response.data.token;
            const userName = response.data.name; // Nome do usuário
            const userId = response.data.id; // Altere para o nome correto do ID do usuário na resposta
            
            // Armazenando informações no localStorage
            if (rememberMe) {
                localStorage.setItem('username', userName);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId); 

            // Conexão do socket
            socket = io('http://localhost:3000', {
                auth: {
                    token: token,
                },
            });

            socket.on('connect', () => {
                console.log('Conectado ao servidor de sockets via Socket.IO');
                socket.emit('register_user', userId);
            });

            socket.on('update_users', (onlineUserIds) => {
                // Armazena a lista de usuários online no localStorage
                localStorage.setItem('onlineUsers', JSON.stringify(onlineUserIds));
            });

            router.push('/chat');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error.response ? error.response.data : error);
        setMessage('Erro ao fazer login, tente novamente.');
    }
};

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nome
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />
        <label>
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Lembrar da Senha
        </label>
        <button type="submit" className={styles.button}>Login</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.signupPrompt}>
        Não tem uma conta? <a href="/signup">Registrar</a>
      </p>
    </div>
  );
};

export default Login;
