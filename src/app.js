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
        mongoose.connect('mongodb://127.0.0.1:27017/maria-gcma', {
            // Opções deprecated removidas
            serverSelectionTimeoutMS: 5000, // Tempo de espera de 5 segundos para seleção do servidor
        })
        .then(() => {
            console.log('Conectado ao MongoDB');
        })
        .catch((error) => {
            console.error('Erro ao conectar ao MongoDB:', error.message);
        });
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
