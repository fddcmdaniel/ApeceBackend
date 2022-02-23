import { DataTypes, Model, Sequelize } from "sequelize";

export class Modules extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      description: DataTypes.STRING,
      title: DataTypes.STRING,
      enable: DataTypes.NUMBER,
      url: DataTypes.STRING
    },
      { sequelize: sequelize, timestamps: false, modelName: 'modules' })
  }
}
