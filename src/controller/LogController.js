import Log from '../models/Log.js';
import User from '../models/User.js';

class LogController {
  
  // Criar um novo log
  async store(req, res) {
    try {
      const {
        userId,
        userName,
        userRole,
        action,
        module,
        details,
        timestamp,
        userAgent
      } = req.body;

      // Capturar IP do request
      const ipAddress = req.ip || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                       req.headers['x-forwarded-for']?.split(',')[0];

      const logData = {
        userId,
        userName,
        userRole,
        action,
        module,
        details,
        ipAddress,
        userAgent,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      };

      const log = new Log(logData);
      await log.save();

      res.status(201).json({
        success: true,
        message: 'Log criado com sucesso',
        data: log
      });

    } catch (error) {
      console.error('Erro ao criar log:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar logs com filtros e paginação
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        action,
        module,
        startDate,
        endDate,
        search,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      // Construir filtros
      const filters = { isDeleted: { $ne: true } };

      if (userId) {
        filters.userId = userId;
      }

      if (action) {
        filters.action = action;
      }

      if (module) {
        filters.module = module;
      }

      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) {
          filters.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.timestamp.$lte = new Date(endDate);
        }
      }

      // Busca textual
      if (search) {
        filters.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { 'details.description': { $regex: search, $options: 'i' } },
          { 'details.itemName': { $regex: search, $options: 'i' } }
        ];
      }

      // Configurar ordenação
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Executar consulta com paginação
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [logs, total] = await Promise.all([
        Log.find(filters)
          .populate('userId', 'nome email role')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar log por ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const log = await Log.findOne({
        _id: id,
        isDeleted: { $ne: true }
      }).populate('userId', 'nome email role');

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log não encontrado'
        });
      }

      res.json({
        success: true,
        data: log
      });

    } catch (error) {
      console.error('Erro ao buscar log:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir log (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.userId; // Vem do middleware de autenticação

      const log = await Log.findOne({
        _id: id,
        isDeleted: { $ne: true }
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log não encontrado'
        });
      }

      await log.softDelete(deletedBy);

      res.json({
        success: true,
        message: 'Log excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir log:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Obter estatísticas
  async stats(req, res) {
    try {
      const stats = await Log.getStats();

      // Estatísticas adicionais
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        logsLast24h,
        logsLast7Days,
        topUsers,
        recentActivity
      ] = await Promise.all([
        Log.countDocuments({
          timestamp: { $gte: last24Hours },
          isDeleted: { $ne: true }
        }),
        
        Log.countDocuments({
          timestamp: { $gte: last7Days },
          isDeleted: { $ne: true }
        }),

        // Top 5 usuários mais ativos
        Log.aggregate([
          { $match: { isDeleted: { $ne: true } } },
          { $group: { _id: '$userId', count: { $sum: 1 }, userName: { $first: '$userName' } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),

        // Atividade recente (últimos 10 logs)
        Log.find({ isDeleted: { $ne: true } })
          .sort({ timestamp: -1 })
          .limit(10)
          .select('action module userName timestamp details.description')
          .lean()
      ]);

      res.json({
        success: true,
        data: {
          ...stats,
          logsLast24h,
          logsLast7Days,
          topUsers,
          recentActivity
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar logs por usuário
  async byUser(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        Log.findByUser(userId)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.countDocuments({ 
          userId: userId, 
          isDeleted: { $ne: true } 
        })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logs do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar logs por ação
  async byAction(req, res) {
    try {
      const { action } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        Log.findByAction(action)
          .populate('userId', 'nome email')
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.countDocuments({ 
          action: action, 
          isDeleted: { $ne: true } 
        })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logs por ação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar logs por módulo
  async byModule(req, res) {
    try {
      const { module } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        Log.findByModule(module)
          .populate('userId', 'nome email')
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.countDocuments({ 
          module: module, 
          isDeleted: { $ne: true } 
        })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logs por módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Busca textual em logs
  async search(req, res) {
    try {
      const { q: searchTerm } = req.query;
      const { page = 1, limit = 20 } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Termo de busca é obrigatório'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        Log.searchLogs(searchTerm)
          .populate('userId', 'nome email')
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.searchLogs(searchTerm).countDocuments()
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          logs,
          searchTerm,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new LogController();

