import bcrypt from "bcryptjs";
import { Questions } from "../modals/Questions";
import { User } from "../modals/User";

export class QuestionsController {

  public static async create(req, res) {
    const { question, moduleId } = req.body;
    const addQuestion = await Questions.create({ question: question, module_id: moduleId });

    if (addQuestion) {
      Questions.max("id").then((id) => res.json(id));
    } else {
      res.sendStatus(400);
    }
  }

  public static async update(req, res) {
    const { question } = req.body;
    const editQuestion = await Questions.findOne({
      where: { id: question.id }
    });

    if (!editQuestion) return res.sendStatus(404);
    // @ts-ignore
    editQuestion.question = question.question;

    await editQuestion.save({});

    const questions = await Questions.findAll({ where: { module_id: question.module_id }, raw: true });
    Object.keys(questions).map((value, i) => questions[value] = { ...questions[value], key: i });
    res.json(questions);
  }

  public static async getAnswers(req, res) {
    const questionId = req.params.id;
    const question = await Questions.findByPk(questionId);

    if (!question) return res.sendStatus(404);

    //@ts-ignore
    const answers = await question.getAnswers({ raw: true });
    Object.keys(answers).map((value, i) => answers[value] = { ...answers[value], key: i });
    res.send(answers);
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

  public static async authenticate(req, res) {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      const bd_password = user.get("password")
      //@ts-ignore
      //const match = await bcrypt.compare(password, hash);
      //const match = await bcrypt.compare(password, hash);
      if (password === bd_password) {
        //req.session.loggedIn = true
        //req.session.userId = user.get("id")
        res.json({ message: "Dados corretos!" });
      } else {
        res.json({ message: "Password não é válida!" });
      }
    } else {
      res.json({ message: "E-mail não registado!" });
    }
  }

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