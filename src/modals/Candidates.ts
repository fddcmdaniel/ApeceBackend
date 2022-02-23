import { DataTypes, Model, Sequelize } from "sequelize";

export class Candidates extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      id_event: DataTypes.INTEGER
    },
      { sequelize: sequelize, timestamps: false, modelName: 'candidates' })
  }
}
