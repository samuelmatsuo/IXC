// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referência ao modelo de usuário
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referência ao modelo de usuário
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Grava a data de criação da mensagem
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
