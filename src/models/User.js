// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'user'], 
    default: 'user'
  }
}, {
  timestamps: {
    createdAt: 'created_at', // nome do campo para a data de criação
    updatedAt: 'updated_at'  // nome do campo para a data de atualização
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
