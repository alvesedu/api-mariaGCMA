require('dotenv').config();
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthController {
  async login(req, res) {
      //console.log("BODY recebido:", req.body);
    const { email, senha } = req.body;

    try {
      // Verifica se o usuário existe no banco de dados
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // *** NOVA VERIFICAÇÃO AQUI ***
      if (!user.senha) {
        console.error(`Usuário ${user.email} encontrado, mas sem senha armazenada.`);
        return res.status(500).json({ message: 'Erro de configuração do usuário: senha não encontrada.' });
      }

      // Verifica se a senha fornecida corresponde à senha armazenada no banco de dados
      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
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

      // Retorna uma resposta de sucesso com o token JWT e o nível de acesso do usuário
      return res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

}

export default new AuthController();
