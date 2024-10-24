const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração de servidor e Socket.IO
const serve = http.createServer(app);
const io = require('socket.io')(serve, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://samuelmatsuo:s27052003@samuelmatsuo.hhi33.mongodb.net/?retryWrites=true&w=majority&appName=samuelmatsuo')
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Básica de Usuários',
            version: '1.0.0',
            description: 'Uma API simples para gerenciar usuários com autenticação JWT',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/userRoutes.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

app.use('/', userRoutes);

const connectedUsers = {};
const onlineUsers = []; // Armazena IDs dos usuários online

io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    // Emite a lista de usuários conectados para o novo usuário
    socket.emit('update_users', onlineUsers);

    // Registra o usuário ao se conectar
    socket.on('register_user', (userId) => {
        connectedUsers[userId] = socket.id;
        if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId); // Adiciona o usuário à lista de onlineUsers
            console.log(`Usuário ${userId} conectado: ${socket.id}`);
            io.emit('user_connected', userId); // Emite para todos que o usuário está conectado
            io.emit('update_users', onlineUsers); // Atualiza a lista de usuários para todos
        }
    });

    // Recebe uma mensagem e a envia ao destinatário
    socket.on('chat_message', (msg) => {
        const { recipientId } = msg;
        if (connectedUsers[recipientId]) {
            // Se o destinatário estiver online, emita a mensagem diretamente
            io.to(connectedUsers[recipientId]).emit('receive_message', msg);
        }
    });

    // Remove o usuário ao desconectar
    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
        for (const userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                onlineUsers.splice(onlineUsers.indexOf(userId), 1); // Remove da lista de onlineUsers
                console.log(`Usuário ${userId} desconectado`);
                io.emit('user_disconnected', userId); // Emite para todos que o usuário está desconectado
                // Envie a lista atualizada de usuários online para todos
                io.emit('update_users', onlineUsers); // Atualiza a lista de usuários para todos
                break; // Pare após encontrar o usuário que desconectou
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
serve.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Documentação do Swagger disponível em http://localhost:${PORT}/api-docs`);
});
