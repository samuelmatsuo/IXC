// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Nome de usuário deve ser único
  },
  password: {
    type: String,
    required: true,
  },
});
// Cria o modelo de usuário
const User = mongoose.model('User', userSchema);

module.exports = User;
