import Log from '../models/Log.js';

// Middleware para logs automáticos de requisições
const autoLogMiddleware = (options = {}) => {
  const {
    excludePaths = ['/health', '/favicon.ico'],
    excludeMethods = ['OPTIONS'],
    includeBody = false,
    includeQuery = true,
    includeHeaders = false
  } = options;

  return async (req, res, next) => {
    // Pular se for path ou método excluído
    if (excludePaths.includes(req.path) || excludeMethods.includes(req.method)) {
      return next();
    }

    // Capturar dados da requisição
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Dados básicos da requisição
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      timestamp: new Date()
    };

    // Incluir query parameters se habilitado
    if (includeQuery && Object.keys(req.query).length > 0) {
      requestData.query = req.query;
    }

    // Incluir body se habilitado (cuidado com dados sensíveis)
    if (includeBody && req.body && Object.keys(req.body).length > 0) {
      // Filtrar campos sensíveis
      const sensitiveFields = ['password', 'senha', 'token', 'secret'];
      const filteredBody = { ...req.body };
      
      sensitiveFields.forEach(field => {
        if (filteredBody[field]) {
          filteredBody[field] = '[FILTERED]';
        }
      });
      
      requestData.body = filteredBody;
    }

    // Override do res.send para capturar resposta
    res.send = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Dados da resposta
      const responseData = {
        statusCode: res.statusCode,
        responseTime,
        contentLength: data ? data.length : 0
      };

      // Criar log assíncrono (não bloquear resposta)
      setImmediate(async () => {
        try {
          // Determinar ação baseada no método e status
          let action = 'ACCESS';
          if (req.method === 'POST') action = 'CREATE';
          else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
          else if (req.method === 'DELETE') action = 'DELETE';
          else if (req.method === 'GET') action = 'READ';

          // Determinar módulo baseado na URL
          let module = 'NAVIGATION';
          if (req.path.includes('/users')) module = 'USER';
          else if (req.path.includes('/vquestionnaires')) module = 'VICTIM';
          else if (req.path.includes('/questionnaires')) module = 'AUTHOR';
          else if (req.path.includes('/promulher')) module = 'PROMULHER';
          else if (req.path.includes('/protege-mulher')) module = 'PROTEGE';
          else if (req.path.includes('/reports')) module = 'REPORT';
          else if (req.path.includes('/login')) module = 'AUTH';

          // Só criar log se houver usuário autenticado
          if (req.userId) {
            const logData = {
              userId: req.userId,
              userName: req.userName || 'Usuário',
              userRole: req.userRole || 'user',
              action,
              module,
              details: {
                description: `${req.method} ${req.path}`,
                request: requestData,
                response: responseData
              },
              ipAddress: requestData.ipAddress,
              userAgent: requestData.userAgent,
              timestamp: requestData.timestamp
            };

            await Log.create(logData);
          }
        } catch (error) {
          console.error('Erro ao criar log automático:', error);
          // Não propagar erro para não afetar a resposta
        }
      });

      // Chamar o send original
      originalSend.call(this, data);
    };

    next();
  };
};

// Middleware específico para logs de autenticação
const authLogMiddleware = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Verificar se é uma resposta de login bem-sucedida
    if (req.path.includes('/login') && res.statusCode === 200 && data.token) {
      setImmediate(async () => {
        try {
          const logData = {
            userId: data.user?.id || data.user?._id,
            userName: data.user?.nome || data.user?.name || data.user?.email || req.body?.email,
            userRole: data.user?.role || 'user',
            action: 'LOGIN',
            module: 'AUTH',
            details: {
              description: 'Login realizado com sucesso',
              loginMethod: 'email_password',
              sessionStart: new Date()
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          };

          await Log.create(logData);
        } catch (error) {
          console.error('Erro ao criar log de login:', error);
        }
      });
    }
    
    // Verificar se é uma tentativa de login falhada
    if (req.path.includes('/login') && res.statusCode === 401) {
      setImmediate(async () => {
        try {
          const logData = {
            userId: null,
            userName: req.body?.email || 'Desconhecido',
            userRole: 'unknown',
            action: 'LOGIN_FAILED',
            module: 'AUTH',
            details: {
              description: 'Tentativa de login falhada',
              email: req.body?.email,
              reason: data.message || 'Credenciais inválidas'
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          };

          await Log.create(logData);
        } catch (error) {
          console.error('Erro ao criar log de login falhado:', error);
        }
      });
    }

    originalJson.call(this, data);
  };

  next();
};

// Middleware para logs de erro
const errorLogMiddleware = (err, req, res, next) => {
  // Log de erro assíncrono
  setImmediate(async () => {
    try {
      const logData = {
        userId: req.userId || null,
        userName: req.userName || 'Sistema',
        userRole: req.userRole || 'system',
        action: 'ERROR',
        module: 'SYSTEM',
        details: {
          description: `Erro: ${err.message}`,
          error: {
            name: err.name,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
          },
          request: {
            method: req.method,
            url: req.originalUrl,
            path: req.path
          }
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      };

      await Log.create(logData);
    } catch (logError) {
      console.error('Erro ao criar log de erro:', logError);
    }
  });

  next(err);
};

// Função para criar log manual
const createManualLog = async (userId, userName, userRole, action, module, details, req = null) => {
  try {
    const logData = {
      userId,
      userName,
      userRole,
      action,
      module,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.get('User-Agent') || null,
      timestamp: new Date()
    };

    return await Log.create(logData);
  } catch (error) {
    console.error('Erro ao criar log manual:', error);
    throw error;
  }
};

// Função para logs de sistema
const systemLog = async (action, module, details) => {
  try {
    const logData = {
      userId: null,
      userName: 'Sistema',
      userRole: 'system',
      action,
      module,
      details,
      timestamp: new Date()
    };

    return await Log.create(logData);
  } catch (error) {
    console.error('Erro ao criar log de sistema:', error);
    throw error;
  }
};

export {
  autoLogMiddleware,
  authLogMiddleware,
  errorLogMiddleware,
  createManualLog,
  systemLog
};

