import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  // Informações do usuário
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Permitir null para logs de sistema
    index: true
  },
  userName: {
    type: String,
    required: true,
    index: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['superadmin', 'admin', 'user', 'system'], // Adicionar 'system'
    index: true
  },

  // Informações da ação
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'EXPORT', 'PRINT',
      'ACCESS', 'SEARCH', 'VIEW',
      'STARTUP', 'SHUTDOWN', 'ERROR' // Adicionar ações de sistema
    ],
    index: true
  },
  module: {
    type: String,
    required: true,
    enum: [
      'VICTIM', 'AUTHOR', 'PROMULHER', 'PROTEGE', 'USER',
      'AUTH', 'DASHBOARD', 'NAVIGATION', 'REPORT', 'SYSTEM' // Adicionar 'SYSTEM'
    ],
    index: true
  },

  // Detalhes da ação
  details: {
    itemName: String,
    itemId: String,
    description: String,
    changes: mongoose.Schema.Types.Mixed,
    searchTerm: String,
    resultsCount: Number,
    exportType: String,
    filters: mongoose.Schema.Types.Mixed,
    pageName: String,
    pageUrl: String,
    error: mongoose.Schema.Types.Mixed,
    version: String,
    environment: String
  },

  // Informações técnicas
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: String,
  
  // Informações de sessão
  sessionId: String,
  
  // Metadados
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Para soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Índices para otimização de consultas
logSchema.index({ userId: 1, action: 1, timestamp: -1 });
logSchema.index({ module: 1, action: 1, timestamp: -1 });
logSchema.index({ timestamp: -1, isDeleted: 1 });
logSchema.index({ userName: 'text', 'details.description': 'text' });

// Middleware para capturar IP automaticamente
logSchema.pre('save', function(next) {
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  next();
});

// Método para soft delete
logSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Método para restaurar
logSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Statics para consultas comuns
logSchema.statics.findActive = function() {
  return this.find({ isDeleted: { $ne: true } });
};

logSchema.statics.findByUser = function(userId) {
  return this.find({ 
    userId: userId, 
    isDeleted: { $ne: true } 
  }).sort({ timestamp: -1 });
};

logSchema.statics.findByAction = function(action) {
  return this.find({ 
    action: action, 
    isDeleted: { $ne: true } 
  }).sort({ timestamp: -1 });
};

logSchema.statics.findByModule = function(module) {
  return this.find({ 
    module: module, 
    isDeleted: { $ne: true } 
  }).sort({ timestamp: -1 });
};

logSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isDeleted: { $ne: true }
  }).sort({ timestamp: -1 });
};

// Método para busca textual
logSchema.statics.searchLogs = function(searchTerm) {
  return this.find({
    $and: [
      { isDeleted: { $ne: true } },
      {
        $or: [
          { userName: { $regex: searchTerm, $options: 'i' } },
          { 'details.description': { $regex: searchTerm, $options: 'i' } },
          { 'details.itemName': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  }).sort({ timestamp: -1 });
};

// Método para estatísticas
logSchema.statics.getStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalLogs,
    logsToday,
    activeUsers,
    mostCommonAction,
    actionStats,
    moduleStats
  ] = await Promise.all([
    // Total de logs
    this.countDocuments({ isDeleted: { $ne: true } }),
    
    // Logs de hoje
    this.countDocuments({
      timestamp: { $gte: today, $lt: tomorrow },
      isDeleted: { $ne: true }
    }),
    
    // Usuários ativos (que fizeram alguma ação nos últimos 30 dias)
    this.distinct('userId', {
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isDeleted: { $ne: true },
      userId: { $ne: null } // Excluir logs de sistema
    }).then(users => users.length),
    
    // Ação mais comum
    this.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).then(result => result[0]?._id || 'N/A'),
    
    // Estatísticas por ação
    this.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Estatísticas por módulo
    this.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  return {
    totalLogs,
    logsToday,
    activeUsers,
    mostCommonAction,
    actionStats,
    moduleStats
  };
};

// Método para limpeza automática de logs antigos
logSchema.statics.cleanOldLogs = function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    isDeleted: true
  });
};

// Virtual para formatação de data
logSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString('pt-BR');
});

// Configurar JSON output
logSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;

