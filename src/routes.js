import { Router } from 'express';
import multer from 'multer';
import uploadConfig from './config/upload';
import UserController from './controller/UserController';
import AuthController from './controller/AuthController';
import AuthMiddleware from './middlweares/AuthMiddleware'; 
import AuthMiddleware from './middlweares/AuthMiddleware'; 
import AuthorQuestionnaireController from './controller/AuthorQuestionnaireController';
import VictimQuestionnaireController from './controller/VictimQuestionnaireController';
import reportsRouter from './routes/reports';


//app.use(express.json());
const routes = new Router();
const upload = multer(uploadConfig);


// Rotas de autenticação
routes.post('/login', AuthController.login);

// Rota para criar um usuário - Remover o comentário se você quiser proteger com autenticação
routes.post('/createUser', /* AuthMiddleware, */ UserController.store);

// Rotas protegidas por autenticação
routes.use(AuthMiddleware); // Aplica o middleware a todas as rotas seguintes

// Rotas de usuário
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);

// Rotas para o questionário Autor
routes.get('/questionnaires', AuthorQuestionnaireController.index);
routes.get('/questionnaires/:id', AuthorQuestionnaireController.show);
routes.post('/questionnaires', AuthorQuestionnaireController.store);
routes.put('/questionnaires/:id', AuthorQuestionnaireController.update);
routes.delete('/questionnaires/:id', AuthorQuestionnaireController.delete);

// Rota para  os questionários de vítimas
routes.get('/vquestionnaires', VictimQuestionnaireController.index);
routes.get('/vquestionnaires/:id', VictimQuestionnaireController.show);
routes.post('/vquestionnaires', VictimQuestionnaireController.store);
routes.put('/vquestionnaires/:id', VictimQuestionnaireController.update);
routes.delete('/vquestionnaires/:id', VictimQuestionnaireController.delete);

// Relatórios
routes.use('/reports', reportsRouter);


export default routes;
