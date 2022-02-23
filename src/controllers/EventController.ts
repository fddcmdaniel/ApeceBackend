import { Sequelize } from 'sequelize';
import { Candidates } from "../modals/Candidates";
import { User } from "../modals/User";
import { Votes } from '../modals/Votes';


export class EventController {

  public static async usersEvents(req, res) {
    const id = req.session.userId;
    const user = await User.findByPk(id);
    if (!user) return res.sendStatus(404);
    //@ts-ignore
    const events = await user.getEvents({
      include: [{
        model: Candidates, as: 'CandidatesEvent'
      }],
      order: [
        ['start_date', 'DESC']
      ]
    });
    res.send(events);
  }

  public static async eventVote(req, res) {
    const idUser = req.session.userId;
    const { id_candidate, id_event } = req.body
    const alreadyVoted = await EventController.asUserVoted(idUser, id_event)

    if (alreadyVoted) return res.json({ message: "Já votou!" })

    const vote = await Votes.create({ id_candidate: id_candidate, id_user: idUser, id_event: id_event });
    if (!vote) return res.sendStatus(404)

    res.json(vote)
  }

  public static async votesEvent(req, res) {
    const id = req.params.id;
    const listVotesCount = await Candidates.findAll({
      attributes: [
        "name",
        "id",
        [
          Sequelize.fn("COUNT", Sequelize.col('votes.id')), "counting"
        ]],
      include: [{
        model: Votes,
        attributes: ["id_candidate", "id_event"],
        required: false
      }],
      where: {
        "id_event": id
      },
      group: [
        "id"
      ],
      order: [
        ['name', 'ASC']
      ]
    })
    res.json(listVotesCount)
  }

  public static async asUserVoted(idUser: number, idEvent: number) {
    const alreadyVoted = await Votes.findOne({ where: { id_user: idUser, id_event: idEvent } });
    return alreadyVoted ? true : false
  }

  public static async voteCheck(req, res) {
    const idUser = req.session.userId;
    const idEvent = req.params.id;
    const alreadyVoted = await EventController.asUserVoted(idUser, idEvent)
    console.log(alreadyVoted)
    res.send(alreadyVoted)
  }

}