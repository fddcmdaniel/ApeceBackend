import { Answers } from "../modals/Answers";

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


}