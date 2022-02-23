import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import { Sequelize } from 'sequelize';
import { AnswersController } from "./controllers/AnswersController";
import { AppController } from "./controllers/AppController";
import { EventController } from "./controllers/EventController";
import { ModulesController } from "./controllers/ModulesController";
import { QuestionsController } from "./controllers/QuestionsController";
import { ResultController } from "./controllers/ResultController";
import { UserController } from "./controllers/UserController";
import { Answers } from "./modals/Answers";
import { Candidates } from "./modals/Candidates";
import { DocumentTypes } from "./modals/DocumentTypes";
import { Event } from "./modals/Event";
import { Modules } from "./modals/Modules";
import { Questions } from "./modals/Questions";
import { Result } from "./modals/Result";
import { User } from "./modals/User";
import { UsersModules } from "./modals/UsersModules";
import { Votes } from "./modals/Votes";

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
  const modals = [User, Modules, Questions, Answers, Result, UsersModules, Event, DocumentTypes, Candidates, Votes];
  modals.forEach((modal) => modal.initialize(sequelize));
  Modules.hasMany(Questions, { foreignKey: "module_id" });
  Questions.hasMany(Answers, { foreignKey: "question_id" });

  User.belongsToMany(Modules, { through: 'users_modules', foreignKey: 'user_id', timestamps: false });
  Modules.belongsToMany(User, { through: 'users_modules', foreignKey: 'module_id', timestamps: false });


  //Result.hasMany(UsersModules, { foreignKey: 'user_module_id' });
  //Questions.belongsTo(Modules, { foreignKey: "module_id" });
  //User.belongsToMany(Event, { through: 'users_events', foreignKey: 'id_user', timestamps: false })
  //Event.belongsToMany(User, { through: 'users_events', foreignKey: 'id_event', timestamps: false })
  //User.belongsTo(DocumentTypes, { as: 'DocType', foreignKey: 'id_doc' });
  //Event.hasMany(Candidates, { as: 'CandidatesEvent', foreignKey: 'id_event' })
  //Candidates.hasMany(Votes, { foreignKey: 'id_candidate' })

  // get all users GET /users
  // get user by GET /users/:id
  // create user POST /users
  // update
  //   just specif fields PATCH /users/:id
  //   entire object PUT /users/:id
  // delete user DELETE /users

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
  app.get('/users/doctypes', UserController.docTypes);

  // Eventos
  app.get('/users/events', EventController.usersEvents);
  app.get('/event/listvotes/:id', EventController.votesEvent);
  app.post('/event/vote', EventController.eventVote);
  app.get('/event/:id/votecheck', EventController.voteCheck);

  // App
  app.get('/convert', AppController.imageToText);

  app.listen(3001, function () {
    console.log("Server started on port 3001");
  })
}

main();

