import { DataTypes, Model, Sequelize } from "sequelize";

export class Questions extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      question: DataTypes.STRING,
      enable: DataTypes.NUMBER,
      module_id: DataTypes.NUMBER
    },
      { sequelize: sequelize, timestamps: false, modelName: 'questions' })
  }
}
