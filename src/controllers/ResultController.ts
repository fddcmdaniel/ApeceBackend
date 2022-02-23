import { QueryTypes } from "sequelize";
import { sequelize } from "..";
import { Result } from "../modals/Result";
import { UsersModules } from "../modals/UsersModules";

export class ResultController {

  public static async create(req, res) {
    const { moduleId, results } = req.body;
    const userId = req.session.userId;
    const userModule = await UsersModules.create({ user_id: userId, module_id: moduleId });

    if (!userModule) return res.sendStatus(404);

    //@ts-ignore
    const resultsUMId = await results.map((r) => ({ ...r, user_module_id: userModule.id }));
    const answersResult = await Result.bulkCreate(resultsUMId);

    if (!answersResult) return res.sendStatus(404);

    const userAnswers = answersResult.map((key) => { return { answer_id: key["answer_id"] } });
    const rightAnswers = await sequelize.query(
      `select a.id as "answer_id" from answers a
      inner join questions q on q.id = a.question_id 
      inner join modules m on m.id  = q.module_id 
      where a.correct  = 1 and m.id = ${moduleId}
      order by a.id`,
      { type: QueryTypes.SELECT }
    );

    let errorAnswersCount = 0;
    userAnswers.forEach((value, i) => {
      if (JSON.stringify(value) !== JSON.stringify(rightAnswers[i])) {
        errorAnswersCount++;
      }
    });

    console.log("User Answers: ", JSON.stringify(userAnswers));
    console.log("System Answers: ", JSON.stringify(rightAnswers));


    const isApproved = JSON.stringify(userAnswers) === JSON.stringify(rightAnswers);
    const finalResult = Math.round(((userAnswers.length - errorAnswersCount) / userAnswers.length) * 100);

    //@ts-ignore
    userModule.result = finalResult;
    await userModule.save({});


    return res.json({ "finalResult": finalResult, "isApproved": isApproved });
  }

}