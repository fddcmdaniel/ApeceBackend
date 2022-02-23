import { DataTypes, Model, Sequelize } from "sequelize";

export class Answers extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      answer: DataTypes.STRING,
      correct: DataTypes.NUMBER,
      enable: DataTypes.NUMBER,
      question_id: DataTypes.NUMBER
    },
      { sequelize: sequelize, timestamps: false, modelName: 'answers' })
  }
}
