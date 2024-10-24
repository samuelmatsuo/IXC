import { useState } from 'react';
import axios from 'axios'; 
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css'; // Importar estilos do módulo

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3000/register', {
        name,
        username,
        password
      });
      
      if (response.status === 201) {
        setMessage('Usuário criado com sucesso!');
        router.push('/login'); // Redireciona para a página de login após o registro
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error.response ? error.response.data : error);
      setMessage('Erro ao registrar, tente novamente.');
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login'); // Navegar para a página de login
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registro</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>Registrar</button>
      </form>
      {message && <p className={styles.message}>{message}</p>} {/* Exibe a mensagem, se houver */}
      <button onClick={handleLoginRedirect} className={styles.button}>Já tem uma conta? Faça login</button>
    </div>
  );
};

export default Signup;
