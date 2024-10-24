import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/update.module.css';

const UpdateUser = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', username: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');

        if (storedToken && storedUserId) {
            setToken(storedToken);
            setUserId(storedUserId);
            setIsLoading(false); // Usuário autenticado, não está mais carregando
        } else {
            setMessage('Usuário não autenticado. Redirecionando para a página de login...');
            setIsLoading(false); // Não está mais carregando
            setTimeout(() => {
                router.push('/login'); // Redireciona para a página de login
            }, 2000);
        }
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verifica se as senhas coincidem
        if (formData.password !== formData.confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3000/users/${userId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Usuário atualizado com sucesso!');

            // Redireciona para a página de login após o sucesso
            setTimeout(() => {
                router.push('/login');
            }, 2000);

            console.log(response.data);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            setMessage('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
        }
    };

    const handleBack = () => {
        router.push('/chat'); // Redireciona para a página de chat
    };

    // Se ainda está carregando, exibe uma mensagem de carregamento
    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h2 className={styles.title}>Atualizar Usuário</h2>
                <button className={styles.backButton} onClick={handleBack}>
                    Voltar
                </button>
                {message && <div className={styles.message}>{message}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome de Usuário</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Atualizar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateUser;
