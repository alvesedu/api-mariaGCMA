import { Router } from 'express';
import LogController from '../controller/LogController.js';
import AuthMiddleware from '../middlweares/AuthMiddleware.js';

const routes = new Router();

// Middleware de autorização para logs
const authorizeLogAccess = (req, res, next) => {
  const userRole = req.userRole;
  
  // Apenas admins e superadmins podem acessar logs
  if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar logs.'
    });
  }
  
  next();
};

// Middleware de autorização para exclusão de logs
const authorizeLogDeletion = (req, res, next) => {
  const userRole = req.userRole;
  
  // Apenas superadmins podem excluir logs
  if (!userRole || userRole !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas super administradores podem excluir logs.'
    });
  }
  
  next();
};

// Middleware de validação para criação de logs
const validateLogCreation = (req, res, next) => {
  const { userId, userName, userRole, action, module } = req.body;
  
  const requiredFields = ['userId', 'userName', 'userRole', 'action', 'module'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
    });
  }
  
  // Validar valores de enum
  const validActions = [
    'CREATE', 'READ', 'UPDATE', 'DELETE',
    'LOGIN', 'LOGOUT',
    'EXPORT', 'PRINT',
    'ACCESS', 'SEARCH', 'VIEW'
  ];
  
  const validModules = [
    'VICTIM', 'AUTHOR', 'PROMULHER', 'PROTEGE', 'USER',
    'AUTH', 'DASHBOARD', 'NAVIGATION', 'REPORT'
  ];
  
  const validRoles = ['superadmin', 'admin', 'user'];
  
  if (!validActions.includes(action)) {
    return res.status(400).json({
      success: false,
      message: `Ação inválida. Valores permitidos: ${validActions.join(', ')}`
    });
  }
  
  if (!validModules.includes(module)) {
    return res.status(400).json({
      success: false,
      message: `Módulo inválido. Valores permitidos: ${validModules.join(', ')}`
    });
  }
  
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({
      success: false,
      message: `Role inválida. Valores permitidos: ${validRoles.join(', ')}`
    });
  }
  
  next();
};

// ===== ROTAS PÚBLICAS (para criação de logs) =====

/**
 * @route   POST /logs
 * @desc    Criar um novo log
 * @access  Private (qualquer usuário autenticado)
 */
routes.post('/', 
  AuthMiddleware, 
  validateLogCreation, 
  LogController.store
);

// ===== ROTAS ADMINISTRATIVAS =====

/**
 * @route   GET /logs
 * @desc    Buscar logs com filtros e paginação
 * @access  Private (admin/superadmin)
 */
routes.get('/', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.index
);

/**
 * @route   GET /logs/stats
 * @desc    Obter estatísticas dos logs
 * @access  Private (admin/superadmin)
 */
routes.get('/stats', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.stats
);

/**
 * @route   GET /logs/search
 * @desc    Busca textual em logs
 * @access  Private (admin/superadmin)
 */
routes.get('/search', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.search
);

/**
 * @route   GET /logs/user/:userId
 * @desc    Buscar logs de um usuário específico
 * @access  Private (admin/superadmin)
 */
routes.get('/user/:userId', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.byUser
);

/**
 * @route   GET /logs/action/:action
 * @desc    Buscar logs por ação
 * @access  Private (admin/superadmin)
 */
routes.get('/action/:action', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.byAction
);

/**
 * @route   GET /logs/module/:module
 * @desc    Buscar logs por módulo
 * @access  Private (admin/superadmin)
 */
routes.get('/module/:module', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.byModule
);

/**
 * @route   GET /logs/:id
 * @desc    Buscar log por ID
 * @access  Private (admin/superadmin)
 */
routes.get('/:id', 
  AuthMiddleware, 
  authorizeLogAccess, 
  LogController.show
);

/**
 * @route   DELETE /logs/:id
 * @desc    Excluir log (soft delete)
 * @access  Private (superadmin)
 */
routes.delete('/:id', 
  AuthMiddleware, 
  authorizeLogDeletion, 
  LogController.delete
);

export default routes;

