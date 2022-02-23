import bcrypt from "bcryptjs";
import { Answers } from "../modals/Answers";
import { User } from "../modals/User";

export class AnswersController {

  public static async asCorrectInserted(questionId: number) {
    const alreadyCorrect = await Answers.findOne({ where: { question_id: questionId, correct: 1 } });
    return alreadyCorrect ? true : false;
  }

  public static async answerCorrectCheck(req, res) {
    const { questionId } = req.body;
    const alreadyCorrect = await AnswersController.asCorrectInserted(questionId);
    res.send(alreadyCorrect);
  }

  public static async create(req, res) {
    const { answer, isCorrect, questionId } = req.body;
    const alreadyCorrect = await AnswersController.asCorrectInserted(questionId);

    if (!alreadyCorrect && isCorrect === 1) {
      const addAnswer = await Answers.create({ answer: answer, correct: isCorrect, question_id: questionId });
      return res.send(true);
    }

    const addAnswer = await Answers.create({ answer: answer, correct: isCorrect, question_id: questionId });
    if (!addAnswer) return res.sendStatus(404);

    console.log("Send: ", alreadyCorrect);
    res.json(alreadyCorrect);
  }

  public static async update(req, res) {
    const { answer } = req.body;

    const editAnswer = await Answers.findByPk(answer.id);
    console.log("A", editAnswer);
    if (!editAnswer) return res.sendStatus(404);
    //@ts-ignore
    editAnswer.answer = answer.answer;
    //@ts-ignore
    if (answer.correct && !editAnswer.correct) {
      await Answers.update({ correct: false }, { where: { question_id: answer.question_id } });
      //@ts-ignore
      editAnswer.correct = true;
    }
    await editAnswer.save({});

    const answers = await Answers.findAll({ where: { question_id: answer.question_id }, raw: true });
    Object.keys(answers).map((value, i) => answers[value] = { ...answers[value], key: i });

    res.json(answers);
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