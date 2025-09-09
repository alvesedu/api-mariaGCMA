
import 'dotenv/config';   // carrega o .env
import express from 'express';
import routes from './routes';
import mongoose from 'mongoose';
import cors from 'cors';
import { authLogMiddleware, errorLogMiddleware, systemLog } from './middleware/LogMiddleware.js';

class App {
  constructor() {
    this.server = express();

    this.database();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  database() {
    const uri = process.env.MONGODB_URI; 
    if (!uri) {
      console.error('❌ Variável MONGODB_URI não definida!');
      process.exit(1);
    }

    mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(async () => {
        console.log('✅ Conectado ao MongoDB');
        
        // Log de sistema para inicialização
        try {
          await systemLog('STARTUP', 'SYSTEM', {
            description: 'API iniciada com sucesso',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
          });
        } catch (error) {
          console.error('Erro ao criar log de inicialização:', error);
        }
      })
      .catch(err =>
        console.error('❌ Erro ao conectar ao MongoDB:', err.message)
      );
  }

  middlewares() {
    // Trust proxy para capturar IP real
    this.server.set('trust proxy', 1);
    
    this.server.use(express.json());
    this.server.use(cors());
    
    // Middleware de logs de autenticação
    this.server.use('/login', authLogMiddleware);
  }

  routes() {
    this.server.use(routes);
  }

  errorHandling() {
    // Middleware de logs de erro
    this.server.use(errorLogMiddleware);
    
    // Handler de erro final
    this.server.use((err, req, res, next) => {
      console.error('Erro não tratado:', err);
      
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // Handler para rotas não encontradas
    this.server.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    });
  }
}

export default new App().server;
