import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import { Sequelize } from 'sequelize';
import { AnswersController } from "./controllers/AnswersController";
import { AppController } from "./controllers/AppController";
import { ModulesController } from "./controllers/ModulesController";
import { QuestionsController } from "./controllers/QuestionsController";
import { ResultController } from "./controllers/ResultController";
import { UserController } from "./controllers/UserController";
import { Answers } from "./modals/Answers";
import { Modules } from "./modals/Modules";
import { Questions } from "./modals/Questions";
import { Result } from "./modals/Result";
import { User } from "./modals/User";
import { UsersModules } from "./modals/UsersModules";

export const sequelize = new Sequelize("app_com_db", "sa", "Joao1234!", {
  dialect: "mssql",
  host: "jduart.ddns.net",
  port: 8080
});

const main = async () => {

  const app = express();

  app.use(express.json());
  app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
  app.use(session({ secret: 'teste', name: 'SessionID', saveUninitialized: false, resave: true }));

  try {
    await sequelize.authenticate();
    // sequelize.sync({ alter: true }) //alter database based on modals structure
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error(error);
    process.exit();
  }

  // Sequelize Models e associações
  const modals = [User, Modules, Questions, Answers, Result, UsersModules];
  modals.forEach((modal) => modal.initialize(sequelize));
  Modules.hasMany(Questions, { foreignKey: "module_id" });
  Questions.hasMany(Answers, { foreignKey: "question_id" });

  User.belongsToMany(Modules, { through: 'users_modules', foreignKey: 'user_id', timestamps: false });
  Modules.belongsToMany(User, { through: 'users_modules', foreignKey: 'module_id', timestamps: false });

  //Middlewares de autenticação
  app.use((req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    if (req.session.loggedIn === true) {
      next()
    } else if (req.path === '/users/authenticate') {
      next()
    } else {
      res.sendStatus(401)
    }
  })


  //User
  app.get('/user/logout', UserController.logout)
  app.post('/users/authenticate', UserController.authenticate);
  //Results
  app.post('/results', ResultController.create);
  // app.get('/answers/right', ResultController.findResults);

  // Modules
  app.post('/module', ModulesController.create);
  app.put('/module', ModulesController.update);
  app.get('/modules', ModulesController.get);
  app.put('/module/enable', ModulesController.updateState);
  app.get('/modules/admin', ModulesController.getAll);

  //Questions
  app.post('/question', QuestionsController.create);
  app.put('/question', QuestionsController.update);
  app.get('/module/:id/questions', ModulesController.getQuestions);

  //Answers
  app.post('/answer', AnswersController.create);
  app.put('/answer', AnswersController.update);
  app.post('/answercheck', AnswersController.answerCorrectCheck);
  app.get('/question/:id/answers', QuestionsController.getAnswers);

  // Users
  app.get('/users', UserController.get)
  app.get('/users/logout', UserController.logout)
  app.get('/users/search', UserController.search)
  app.put('/users/update', UserController.update);
  app.put('/users/updatepassword', UserController.updatePassword);

  // App
  app.post('/convert', AppController.imageToText);

  app.listen(3001, function () {
    console.log("Server started on port 3001");
  })
}

main();

