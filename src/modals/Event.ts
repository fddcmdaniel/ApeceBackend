import { DataTypes, Model, Sequelize } from "sequelize";

export class Event extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      enable: DataTypes.INTEGER,
      enable_edit: DataTypes.INTEGER
    },
      { sequelize: sequelize, timestamps: false, modelName: 'events' })
  }
}
