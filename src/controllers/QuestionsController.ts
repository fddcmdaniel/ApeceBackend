import { Questions } from "../modals/Questions";

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

}