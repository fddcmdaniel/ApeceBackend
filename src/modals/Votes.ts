import { DataTypes, Model, Sequelize } from "sequelize";

export class Votes extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      id_candidate: DataTypes.INTEGER,
      id_user: DataTypes.INTEGER,
      id_event: DataTypes.INTEGER,
      is_public: DataTypes.INTEGER
    },
      { sequelize: sequelize, timestamps: false, modelName: 'votes' })
  }
}
