
import 'dotenv/config';   // carrega o .env
import express from 'express';
import routes from './routes';
import mongoose from 'mongoose';
import cors from 'cors';

class App {
  constructor() {
    this.server = express();

    this.database();
    this.middlewares();
    this.routes();
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
      .then(() => console.log('✅ Conectado ao MongoDB'))
      .catch(err =>
        console.error('❌ Erro ao conectar ao MongoDB:', err.message)
      );
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(cors());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
