import { DataTypes, Model, Sequelize } from "sequelize";

export class DocumentTypes extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      description: DataTypes.STRING
    },
      { sequelize: sequelize, timestamps: false, modelName: 'type_documents' })
  }
}
