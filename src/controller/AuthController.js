require('dotenv').config();
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createManualLog } from '../middleware/LogMiddleware.js';

class AuthController {
  async login(req, res) {
      //console.log("BODY recebido:", req.body);
    const { email, senha } = req.body;

    try {
      // Verifica se o usuário existe no banco de dados
      const user = await User.findOne({ email });

      if (!user) {
        // Log de tentativa de login com email inexistente
        try {
          await createManualLog(
            null,
            email,
            'unknown',
            'LOGIN_FAILED',
            'AUTH',
            {
              description: 'Tentativa de login com email inexistente',
              email: email,
              reason: 'Usuário não encontrado'
            },
            req
          );
        } catch (logError) {
          console.error('Erro ao criar log de login falhado:', logError);
        }
        
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // *** NOVA VERIFICAÇÃO AQUI ***
      if (!user.senha) {
        console.error(`Usuário ${user.email} encontrado, mas sem senha armazenada.`);
        
        // Log de erro de configuração
        try {
          await createManualLog(
            user._id,
            user.nome,
            user.role,
            'ERROR',
            'AUTH',
            {
              description: 'Erro de configuração: usuário sem senha',
              email: user.email,
              reason: 'Senha não encontrada no banco'
            },
            req
          );
        } catch (logError) {
          console.error('Erro ao criar log de erro:', logError);
        }
        
        return res.status(500).json({ message: 'Erro de configuração do usuário: senha não encontrada.' });
      }

      // Verifica se a senha fornecida corresponde à senha armazenada no banco de dados
      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        // Log de tentativa de login com senha incorreta
        try {
          await createManualLog(
            user._id,
            user.nome,
            user.role,
            'LOGIN_FAILED',
            'AUTH',
            {
              description: 'Tentativa de login com senha incorreta',
              email: user.email,
              reason: 'Senha inválida'
            },
            req
          );
        } catch (logError) {
          console.error('Erro ao criar log de login falhado:', logError);
        }
        
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Determina o nível de acesso do usuário
      let role = 'user';
      if (user.role === 'superadmin' || user.role === 'admin') {
        role = user.role;
      }

      // Gera o token JWT incluindo o userId e role no payload
      const token = jwt.sign(
        { userId: user._id, role: role }, // Inclui o role no token
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );

      // Log de login bem-sucedido
      try {
        await createManualLog(
          user._id,
          user.nome,
          user.role,
          'LOGIN',
          'AUTH',
          {
            description: 'Login realizado com sucesso',
            email: user.email,
            loginMethod: 'email_password',
            sessionStart: new Date(),
            tokenExpiry: '5h'
          },
          req
        );
      } catch (logError) {
        console.error('Erro ao criar log de login:', logError);
      }

      // Retorna uma resposta de sucesso com o token JWT e o nível de acesso do usuário
      return res.status(200).json({ 
        message: 'Login bem-sucedido', 
        token,
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error(error);
      
      // Log de erro interno
      try {
        await createManualLog(
          null,
          'Sistema',
          'system',
          'ERROR',
          'AUTH',
          {
            description: 'Erro interno no processo de login',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          },
          req
        );
      } catch (logError) {
        console.error('Erro ao criar log de erro:', logError);
      }
      
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

}

export default new AuthController();
