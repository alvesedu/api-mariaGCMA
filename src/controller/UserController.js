// controllers/SessionController.js

import User from '../models/User';
import bcrypt from 'bcrypt';
import AuthMiddleware from '../middlweares/AuthMiddleware.js';

class UserController {
  /* async index(req, res) {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } */

  constructor() {
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.store = this.store.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async index(req, res) {
    try {
      let users;

      // Verifica se o usuário que está fazendo a solicitação é um administrador
      if (req.user.role === 'admin') {
        // Se for um administrador, lista todos os usuários
        users = await User.find();
      } else {
        // Se não for um administrador, lista apenas as informações do usuário atual
        users = await User.findById(req.user._id);
      }

      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }


  async show(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async store(req, res) {
    const { nome, email, senha, role } = req.body;
  
    try {
      // Verifica se o usuário já existe no banco de dados
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe!' });
      }
  
      // Criptografa a senha antes de salvar no banco de dados
      const hashedPassword = await bcrypt.hash(senha, 10);
  
      // Cria um novo usuário
      const newUser = new User({ nome, email, senha: hashedPassword, role });
  
      // Salva o novo usuário no banco de dados
      await newUser.save();
  
      return res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor!' });
    }
  }
  

  async update(req, res) {
    const { id } = req.params;
    const { nome, email, senha, role } = req.body;
  
    try {
      let user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      // Atualiza os dados do usuário
      user.email = email;
      user.role = role;
  
      // Se a senha foi fornecida e é diferente da senha atual, criptografe-a
      if (senha && senha !== user.senha) {
        user.senha = await bcrypt.hash(senha, 10);
      }
  
      // Salva as alterações no banco de dados
      await user.save();
  
      return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  

  async delete(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UserController();
