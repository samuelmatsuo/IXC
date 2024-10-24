const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const users = require('../models/User');

// Objeto para armazenar usuários conectados
const connectedUsers = {}; // Mova esta linha para o topo para garantir que esteja disponível

// Registro de usuários
const registerUser = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = new users({
      name,
      username,
      password: bcrypt.hashSync(password, 8),
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

// Login de usuários
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await users.findOne({ username });
    if (!user) {
      console.log(`Usuário não encontrado: ${username}`); // Log adicional
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_KEY || 'your_secret_key',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      name: user.name,
      id: user._id // Retorno do ID do usuário
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Listagem de usuários
const getUsers = async (req, res) => {
  try {
    const usersList = await users.find();
    res.json(usersList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criação de mensagens
const createMessage = async (req, res) => {
  const { message, recipientId } = req.body;
  const senderId = req.user.id;
  const senderName = req.user.username; // Assumindo que o nome do usuário está armazenado em req.user

  if (!message || !recipientId) {
    return res.status(400).json({ message: 'Mensagem e destinatário são obrigatórios' });
  }

  try {
    const recipient = await users.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinatário não encontrado' });
    }

    const newMessage = new Message({
      message,
      sender: senderId,
      senderName, // Adicione o nome do remetente
      recipient: recipientId,
    });

    await newMessage.save();

    // Emitir a mensagem via Socket.IO para o destinatário
    const recipientSocketId = connectedUsers[recipientId];
    if (recipientSocketId) {
      req.io.to(recipientSocketId).emit('receive_message', {
        message,
        senderId,
        senderName, // Inclua o nome do remetente na mensagem enviada pelo socket
      });
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Erro ao enviar mensagem' });
    }
  }
};

// Listar mensagens entre dois usuários
const getMessagesBetweenUsers = async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).populate('sender', 'username') // Popula com o username do remetente
      .populate('recipient', 'username'); // Popula com o username do destinatário

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar mensagens' });
  }
};

// Atualização de usuário

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, username, password, confirmPassword } = req.body;

  // Verifica se pelo menos um campo foi fornecido
  if (!name && !username && !password) {
      return res.status(400).json({ message: 'Pelo menos um campo deve ser fornecido para atualização' });
  }

  try {
      // Busca o usuário pelo ID
      const user = await users.findById(userId);
      
      // Verifica se o usuário foi encontrado
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const updatedData = {};

      // Atualiza os campos permitidos
      if (name) updatedData.name = name;
      if (username) updatedData.username = username;

      // Verificação de senha
      if (password) {
          if (password !== confirmPassword) {
              return res.status(400).json({ message: 'A senha e a confirmação de senha não coincidem' });
          }

          // Hash da nova senha
          const hashedPassword = await bcrypt.hash(password, 10);
          updatedData.password = hashedPassword; // Substitui a senha pelo hash
      }

      // Atualiza o usuário no banco de dados
      const updatedUser = await users.findByIdAndUpdate(userId, updatedData, { new: true });

      // Se o usuário foi atualizado com sucesso, retorna os dados do usuário atualizado
      return res.json(updatedUser);
  } catch (error) {
      console.error('Erro ao atualizar usuário:', error); // Log de erro
      return res.status(500).json({ message: 'Erro ao atualizar usuário. Tente novamente mais tarde.' });
  }
};

// Exportação dos controladores
module.exports = { registerUser, loginUser, getUsers, createMessage, getMessagesBetweenUsers, updateUser };
