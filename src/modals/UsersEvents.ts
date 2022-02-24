import { DataTypes, Model, Sequelize } from "sequelize";
import { Event } from "./Event";
import { User } from "./User";

export class UsersEvents extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      id_user: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' }
      },
      id_event: {
        type: DataTypes.INTEGER,
        references: { model: Event, key: 'id' }
      }
    },
      { sequelize: sequelize, timestamps: false, modelName: 'users_events' })
  }
}
