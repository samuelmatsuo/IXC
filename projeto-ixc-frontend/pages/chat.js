import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useRouter } from 'next/router'; // Importando useRouter
import styles from '../styles/chat.module.css';

const socket = io('http://localhost:3000'); // Altere para o seu endereço de servidor, se necessário

const Chat = () => {
    const router = useRouter(); // Usando useRouter para navegação
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fetchInterval, setFetchInterval] = useState(null); // Para gerenciar o intervalo
    const [popupMessage, setPopupMessage] = useState(''); // Mensagem para o pop-up
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); // Nome do usuário logado
    const userId = localStorage.getItem('userId'); // ID do usuário logado

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const usersWithStatus = response.data.map(user => ({
                    ...user,
                    isOnline: false, // Inicializa como offline
                }));

                const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
                setUsers(usersWithStatus.map(user => ({
                    ...user,
                    isOnline: onlineUsers.includes(user._id),
                })));
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        fetchUsers();

        socket.on('connect', () => {
            console.log('Conectado ao servidor de sockets via Socket.IO');
            if (userId) {
                socket.emit('register_user', userId);
                fetchUsers(); // Busca novamente os usuários ao conectar
            }
        });

        socket.on('update_users', (onlineUserIds) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) => ({
                    ...user,
                    isOnline: onlineUserIds.includes(user._id),
                }))
            );
        });

        socket.on('connect_error', (err) => {
            console.error('Erro ao conectar ao servidor de sockets:', err.message);
        });

        socket.on('receive_message', (msg) => {
            console.log('Mensagem recebida:', msg);
            setMessages((prevMessages) => [...prevMessages, msg]);

            // Verifica se a mensagem é para o usuário logado
            if (msg.recipientId === userId) {
                // Se a mensagem for para o usuário logado, exibe a notificação
                setPopupMessage(`Nova mensagem de ${msg.senderName}: ${msg.message}`);

                // Limpa o pop-up após 5 segundos
                setTimeout(() => {
                    setPopupMessage('');
                }, 5000);
            }
        });

        socket.on('user_connected', (connectedUserId) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === connectedUserId ? { ...user, isOnline: true } : user
                )
            );
        });

        socket.on('user_disconnected', (disconnectedUserId) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === disconnectedUserId ? { ...user, isOnline: false } : user
                )
            );
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_connected');
            socket.off('user_disconnected');
            socket.off('update_users');
        };
    }, [token, userId]);

    const handleSelectUser = (user) => {
        if (user) {
            setSelectedUser(user._id); // Armazena o ID do usuário selecionado
            fetchMessages(userId, user._id); // Busca mensagens ao selecionar o usuário

            // Limpa a notificação ao abrir a conversa
            setPopupMessage(''); // Remove a notificação ao abrir a conversa

            // Inicia o intervalo de busca de mensagens a cada 1 segundo
            const intervalId = setInterval(() => {
                fetchMessages(userId, user._id);
            }, 1000);
            setFetchInterval(intervalId); // Armazena o ID do intervalo
        }
    };

    const fetchMessages = async (userId, selectedUser) => {
        if (userId && selectedUser) {
            try {
                const response = await axios.get(`http://localhost:3000/messages/${userId}/${selectedUser}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data); // Atualiza as mensagens com as conversas existentes
            } catch (error) {
                console.error('Erro ao buscar mensagens:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() && selectedUser) {
            const messageData = {
                message: inputValue,
                recipientId: selectedUser,
                senderId: userId,
                senderName: username, // Inclua o nome do remetente na mensagem
            };

            try {
                const response = await axios.post('http://localhost:3000/messages', messageData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Emitir a mensagem para o servidor, para que todos os usuários conectados possam receber
                socket.emit('chat_message', response.data);

                // Armazena a mensagem localmente apenas para o remetente
                setMessages((prevMessages) => [...prevMessages, response.data]);

                // Não exibe notificação ao enviar a mensagem, apenas armazena a mensagem
                setInputValue(''); // Limpa o campo de entrada
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const handleLogoff = () => {
        localStorage.clear();
        socket.disconnect(); // Desconecta do Socket.IO
        window.location.href = '/login'; // Redireciona para a página de login
    };

    useEffect(() => {
        // Limpa o intervalo quando o componente é desmontado ou quando o usuário selecionado muda
        return () => {
            if (fetchInterval) {
                clearInterval(fetchInterval);
            }
        };
    }, [fetchInterval]);

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                <div className={styles.userList}>
                    <h2>Usuários</h2>
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className={`${styles.user} ${selectedUser === user._id ? styles.selected : ''}`}
                            onClick={() => handleSelectUser(user)}
                        >
                            <span className={`${styles.onlineIndicator} ${user.isOnline ? styles.online : styles.offline}`}></span>
                            {user.name}
                        </div>
                    ))}
                </div>
                <div className={styles.messageArea}>
                    <div className={styles.selectedUserInfo}>
                        {selectedUser ? (
                            <div className={styles.selectedUserHeader}>
                                <span className={`${styles.onlineIndicator} ${users.find(user => user._id === selectedUser)?.isOnline ? styles.online : styles.offline}`}></span>
                                <span className={styles.selectedUserName}>
                                    {users.find(user => user._id === selectedUser)?.name}
                                </span>
                            </div>
                        ) : (
                            <h2>Chat</h2> // Título padrão antes de selecionar o usuário
                        )}
                    </div>

                    <div className={styles.messages}>
                        {messages.length === 0 ? (
                            <div>Nenhuma mensagem encontrada.</div>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className={styles.message}>
                                    <strong>{message.senderName}:</strong> {message.message} {/* Exibe o nome do remetente */}
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className={styles.input}
                        />
                        <button onClick={handleSendMessage} className={styles.button}>
                            Enviar
                        </button>
                    </div>
                </div>
                <div className={styles.userInfo}>
                    <span>{username}</span>
                    <button onClick={handleLogoff} className={styles.logoffButton}>
                        Logoff
                    </button>
                    {/* Botão para navegar para a tela de atualização */}
                    <div className={styles.updateButtonContainer}>
                        <button onClick={() => router.push('/update')} className={styles.updateButton}>
                            Alterar
                        </button>
                    </div>
                </div>
            </div>
            {popupMessage && (
                <div className={styles.popup}>
                    {popupMessage}
                </div>
            )}
        </div>
    );
};

export default Chat;
