import bcrypt from "bcryptjs";
import { DocumentTypes } from "../modals/DocumentTypes";
import { Modules } from "../modals/Modules";
import { User } from "../modals/User";
import { UsersModules } from "../modals/UsersModules";

export class ModulesController {

  public static async get(req, res) {
    const id = req.session.userId;
    const user = await User.findByPk(id);
    if (!user) return res.sendStatus(404);
    //@ts-ignore
    const userModules = await user.getModules({ raw: true }); // Modules By user
    const modules = await Modules.findAll({ where: { enable: 1 }, raw: true }); // All modules

    userModules.map((value: number) => {
      Object.keys(modules).map((key) => {
        if (value['id'] === modules[key].id) {
          return modules[key] = { ...modules[key], alreadyDone: true, result: value['users_modules.result'] };
        } else if (modules[key].alreadyDone !== true) {
          modules[key] = { ...modules[key], alreadyDone: false, result: null };
        }
      });
    });

    res.json(modules);
  }

  public static async getAll(req, res) {
    const modules = await Modules.findAll({ raw: true });
    if (!modules) res.sendStatus(404);
    Object.keys(modules).map((value, i) => modules[value] = { ...modules[value], key: i });

    res.json(modules);
  }

  public static async getQuestions(req, res) {
    const moduleId = req.params.id;
    const module = await Modules.findByPk(moduleId);
    const alreadyModule = await UsersModules.findOne({
      where: {
        module_id: moduleId
      }
    });

    if (!module) return res.sendStatus(404);

    //@ts-ignore
    const questions = await module.getQuestions({ raw: true });
    Object.keys(questions).map((value, i) => questions[value] = { ...questions[value], key: i });

    res.json({ questions: questions, alreadyModule: alreadyModule ? true : false });
  }

  public static async updateState(req, res) {
    const { moduleId, enable } = req.body;
    const module = await Modules.findOne({ where: { id: moduleId } });
    if (!module) return res.sendStatus(404);

    // @ts-ignore
    module.enable = !enable;
    await module.save({});

    // @ts-ignore
    res.json(module.enable);
  }

  public static async update(req, res) {
    const { module } = req.body;
    console.log("Hi", module);
    const editModule = await Modules.findOne({
      where: { id: module.id }
    });

    if (!editModule) return res.sendStatus(404);

    // @ts-ignore
    editModule.title = module.title;
    // @ts-ignore
    editModule.description = module.description;
    // @ts-ignore
    editModule.url = (module.url).split("watch?v=")[1];
    await editModule.save({});

    const modules = await Modules.findAll({ raw: true });
    Object.keys(modules).map((value, i) => modules[value] = { ...modules[value], key: i });
    res.json(modules);
  }





  public static async docTypes(req, res) {
    DocumentTypes.findAll().then((documents) => res.json(documents))
  }

  // public static async get(req, res) {
  //   const id = req.session.userId;
  //   const user = await User.findOne({
  //     where: { id: id },
  //     include: [{
  //       model: DocumentTypes, as: 'DocType'
  //     }],
  //     attributes: { exclude: ['password'] }
  //   });
  //   res.send(user);
  // }

  public static async create(req, res) {
    const { module } = req.body;
    const splitedURL = module.url.split("watch?v=")[1];
    const newModule = await Modules.create({ title: module.title, description: module.description, url: splitedURL });

    newModule ? await Modules.findAll().then((modules) => res.json(modules)) : res.sendStatus(404);
  }

  public static async updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    const id = req.session.userId;

    const user = await User.findByPk(id)

    if (user) {
      //@ts-ignore
      const match = await bcrypt.compare(currentPassword, user.password)
      if (match) {
        const password = await bcrypt.hash(newPassword, 10)
        //@ts-ignore
        user.password = password.replace("$2a", "$2y")
        await user.save({})
        res.json({ message: "Password alterada com sucesso" });
      } else {
        res.json({ message: "Password actual não é válida!" });
      }
    } else {
      res.sendStatus(404)
    }
  }



  // public static async update(req, res) {
  //   const id = req.session.userId;
  //   const user = await User.findOne({
  //     where: { id: id },
  //     include: [{
  //       model: DocumentTypes, as: 'DocType'
  //     }],
  //     attributes: { exclude: ['password'] }
  //   });
  //   const { name, genre, id_doc, doc_number } = req.body

  //   if (user === null) {
  //     return res.sendStatus(404)
  //   }
  //   // @ts-ignore
  //   user.name = name
  //   // @ts-ignore
  //   user.genre = genre
  //   // @ts-ignore
  //   user.id_doc = id_doc
  //   // @ts-ignore
  //   user.doc_number = doc_number


  //   await user.save({})
  //   await user.reload({
  //     include: [{
  //       model: DocumentTypes, as: 'DocType'
  //     }]
  //   })
  //   res.json(user)
  // }



  public static async logout(req, res) {
    if (req.session.loggedIn) {
      req.session.loggedIn = false
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send(false)
        }
      });
    } else {
      res.end()
    }
  }

}