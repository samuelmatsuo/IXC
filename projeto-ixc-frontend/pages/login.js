import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
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
      const response = await axios.post(
        'http://localhost:3000/users/login',
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.status);
      
      if (response.status === 201) {
        const { name, id_user } = response.data;

        localStorage.setItem('username', username);
        localStorage.setItem('userId', id_user);
        localStorage.setItem('name', name);

        console.log('Redirecionando para o chat...');

        console.log(response.status);

        await router.push('/chat');
      }
      if(response.status === 400 || response.status === 500){
        console.log('aaaaaaaaaaaaaaaaaaaaaaa');
        setMessage('Credenciais inválidas');
        await router.push('/login');

      }
    } catch (error) {
      console.error('Erro ao fazer login:', error.response ? error.response.data : error);
      setMessage('Erro ao fazer login, tente novamente.');
    }
  };

  const handleSignupRedirect = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Nome</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />
        <label>Senha</label>
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
        <button type="button" onClick={handleSignupRedirect} className={styles.button}>
          Não tem uma conta? Registrar
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Login;
