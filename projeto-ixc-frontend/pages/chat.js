import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/chat.module.css';
import { wsconnect } from '@nats-io/nats-core';

const Chat = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);
    const [natsClient, setNatsClient] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        setUsername(storedUsername);
        setUserId(storedUserId);

        const connectToNATS = async () => {
            if (!natsClient) {
                try {
                    const client = await wsconnect({ servers: ['ws://localhost:3222']});
                    console.log('Conectado ao NATS:', !client.isClosed());
                    setNatsClient(client);

                    client.closed().then(() => {
                        console.warn('Conexão com NATS encerrada.');
                        setNatsClient(null);
                    });
                } catch (error) {
                    console.error('Erro ao conectar ao NATS:', error);
                }
            }
        };

        connectToNATS();

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users/getUsers');
                const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
                setUsers(
                    response.data.map((user) => ({
                        ...user,
                        isOnline: onlineUsers.includes(user._id),
                    }))
                );
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };

        fetchUsers();

        return () => {
            if (natsClient) {
                natsClient.close();
            }
        };
    }, [natsClient]);

    const handleSelectUser = async (user) => {
        if (user) {
            console.log('Usuário selecionado:', user);
            setSelectedUser(user._id);
            await fetchMessages(userId, user._id);
        } else {
            console.warn('Usuário inválido selecionado.');
        }
    };

    const fetchMessages = async (userId, selectedUser) => {
        if (!natsClient || natsClient.isClosed()) {
            console.error('Conexão com NATS fechada ou não inicializada.');
            return;
        }

        if (userId && selectedUser) {
            try {
                const response = await natsClient.request(
                    userId + '.find',
                    JSON.stringify({ senderId: userId, recipientId: selectedUser }),
                    { timeout: 5000 }
                );

                const decodedMessages = response.json();
                setMessages(decodedMessages);
            } catch (error) {
                console.error('Erro ao buscar mensagens:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() && selectedUser) {
            const messageData = {
                message: inputValue,
                senderId: userId,
                recipientId: selectedUser,
                senderName: username,
            };

            if (natsClient && !natsClient.isClosed()) {
                await natsClient.request(selectedUser + '.msg.new', JSON.stringify(messageData));
                setMessages((prevMessages) => [...prevMessages, messageData]);
                setInputValue('');
            } else {
                console.error('Erro: Cliente NATS não está conectado.');
            }
        }
    };

    const handleLogoff = async () => {
        localStorage.clear();
        if (natsClient && !natsClient.isClosed()) {
            await natsClient.close();
        }
        localStorage.clear();
        router.push('/login');
    };

    const removeNotification = (index) => {
        setNotifications((prevNotifications) => prevNotifications.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (natsClient && userId) {
            const subscription = natsClient.subscribe(userId + '.msg.notify', {
                callback: async (err, msg) => {
                    if (err) {
                        console.error('Erro no callback NATS:', err);
                        return;
                    }
                    if (msg) {
                        try {
                            const decodedMessage = JSON.parse(new TextDecoder().decode(msg.data));
                            if (decodedMessage.senderId === selectedUser) {
                                setMessages((prevMessages) => [...prevMessages, decodedMessage]);
                                setInputValue('');
                            } else {
                                setNotifications((prevNotifications) => [
                                    ...prevNotifications,
                                    {
                                        senderId: decodedMessage.senderId,
                                        senderName: decodedMessage.senderName,
                                        message: decodedMessage.message,
                                    },
                                ]);
                            }
                        } catch (decodeError) {
                            console.error('Erro ao decodificar a mensagem:', decodeError);
                        }
                    } else {
                        console.warn('Mensagem recebida é nula ou indefinida.');
                    }
                },
            });

            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [natsClient, userId, selectedUser]);

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
                            <span
                                className={`${styles.onlineIndicator} ${
                                    user.isOnline ? styles.online : styles.offline
                                }`}
                            ></span>
                            {user.name}
                        </div>
                    ))}
                </div>
                <div className={styles.messageArea}>
                    <div className={styles.selectedUserInfo}>
                        {selectedUser ? (
                            <div className={styles.selectedUserHeader}>
                                <span
                                    className={`${styles.onlineIndicator} ${
                                        users.find((user) => user._id === selectedUser)?.isOnline
                                            ? styles.online
                                            : styles.offline
                                    }`}
                                ></span>
                                <span className={styles.selectedUserName}>
                                    {users.find((user) => user._id === selectedUser)?.name}
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
            <div className={styles.notificationContainer}>
                {notifications.map((notif, index) => (
                    <div
                        key={index}
                        className={styles.notification}
                        onClick={() => removeNotification(index)}
                    >
                        <strong>{"mensagem nova de " + notif.senderName}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
