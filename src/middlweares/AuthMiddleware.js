import jwt from 'jsonwebtoken';
import User from '../models/User';

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Verifica se está tentando autenticar com email diretamente (não recomendado no middleware)
      const { email } = req.body;

      if (email) {
        const adminUser = await User.findOne({ email });

        if (adminUser && adminUser.role === 'admin') {
          req.user = adminUser;
          // Adicionar dados para logs
          req.userId = adminUser._id;
          req.userName = adminUser.nome;
          req.userRole = adminUser.role;
          return next();
        }
      }

      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.userId) {
      return res.status(401).json({ message: 'Token malformado ou ausente de userId' });
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = user;
    // Adicionar dados para logs
    req.userId = user._id;
    req.userName = user.nome;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Erro no authenticate middleware:', error);
    return res.status(401).json({ message: 'Falha na autenticação' });
  }
}

export default authenticate;
