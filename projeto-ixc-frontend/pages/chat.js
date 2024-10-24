import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/chat.module.css';

const socket = io('http://localhost:3000');

const Chat = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fetchInterval, setFetchInterval] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Lê os valores do localStorage no lado do cliente
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        
        setToken(storedToken);
        setUsername(storedUsername);
        setUserId(storedUserId);

        if (!storedToken) {
            router.push('/login'); // Redireciona para a página de login se não houver token
        }
    }, [router]);

    useEffect(() => {
        if (!token || !userId) return; // Verifica se o token e userId estão disponíveis

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
                setUsers(response.data.map(user => ({
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
            socket.emit('register_user', userId);
            fetchUsers();
        });

        socket.on('update_users', (onlineUserIds) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) => ({
                    ...user,
                    isOnline: onlineUserIds.includes(user._id),
                }))
            );
        });

        socket.on('receive_message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
            if (msg.recipientId === userId) {
                setPopupMessage(`Nova mensagem de ${msg.senderName}: ${msg.message}`);
                setTimeout(() => setPopupMessage(''), 5000);
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('update_users');
        };
    }, [token, userId]);

    const handleSelectUser = (user) => {
        if (user) {
            setSelectedUser(user._id);
            fetchMessages(userId, user._id);
            setPopupMessage('');

            const intervalId = setInterval(() => {
                fetchMessages(userId, user._id);
            }, 1000);
            setFetchInterval(intervalId);
        }
    };

    const fetchMessages = async (userId, selectedUser) => {
        if (userId && selectedUser) {
            try {
                const response = await axios.get(`http://localhost:3000/messages/${userId}/${selectedUser}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data);
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
                senderName: username,
            };

            try {
                const response = await axios.post('http://localhost:3000/messages', messageData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                socket.emit('chat_message', response.data);
                setMessages((prevMessages) => [...prevMessages, response.data]);
                setInputValue('');
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const handleLogoff = () => {
        localStorage.clear();
        socket.disconnect(); // Desconecta do Socket.IO
        router.push('/login'); // Redireciona para a página de login
    };

    useEffect(() => {
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
                            <h2>Chat</h2>
                        )}
                    </div>

                    <div className={styles.messages}>
                        {messages.length === 0 ? (
                            <div>Nenhuma mensagem encontrada.</div>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className={styles.message}>
                                    <strong>{message.senderName}:</strong> {message.message}
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
                    <button onClick={() => router.push('/update')} className={styles.updateButton}>
                        Alterar
                    </button>
                    <div className={styles.updateButtonContainer}>
                        <button onClick={handleLogoff} className={styles.logoffButton}>
                            Logoff
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
