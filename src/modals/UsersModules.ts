import { DataTypes, Model, Sequelize } from "sequelize";
import { Modules } from "./Modules";
import { User } from "./User";

export class UsersModules extends Model {

  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' }
      },
      module_id: {
        type: DataTypes.INTEGER,
        references: { model: Modules, key: 'id' }
      },
      result: DataTypes.REAL
    },
      { sequelize: sequelize, timestamps: false, modelName: 'users_modules' })
  }
}
