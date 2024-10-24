const express = require('express');
const { registerUser, loginUser, getUsers, createMessage, getMessagesBetweenUsers, updateUser } = require('../controllers/userControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Adiciona um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna o token JWT
 *       401:
 *         description: Falha na autenticação
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna uma lista de usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get('/users', authenticateToken, getUsers);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Cria uma nova mensagem e encaminha para o destinatário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               recipientId:
 *                 type: string
 *                 description: ID do usuário destinatário
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso e encaminhada para o destinatário
 *       400:
 *         description: Dados inválidos
 */
router.post('/messages', authenticateToken, createMessage);

/**
 * @swagger
 * /messages/{senderId}/{recipientId}:
 *   get:
 *     summary: Retorna mensagens entre dois usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: senderId
 *         in: path
 *         required: true
 *         description: ID do usuário remetente
 *         schema:
 *           type: string
 *       - name: recipientId
 *         in: path
 *         required: true
 *         description: ID do usuário destinatário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de mensagens entre os dois usuários
 *       404:
 *         description: Mensagens não encontradas
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/messages/:senderId/:recipientId', authenticateToken, getMessagesBetweenUsers);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza os dados do usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Nova senha do usuário (opcional)
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmação da nova senha (opcional)
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/users/:id', authenticateToken, updateUser);


module.exports = router;
