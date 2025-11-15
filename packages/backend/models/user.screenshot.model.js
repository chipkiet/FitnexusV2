// models/user.screenshot.model.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class UserScreenshot extends Model {}
 
UserScreenshot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
 
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    object_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    feature: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },

    is_favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active", // active | deleted
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_screenshots",
    modelName: "UserScreenshot",
    timestamps: false, // vì em đã tự dùng created_at, updated_at
    underscored: true, // vì tên cột theo snake_case
  }
);

export default UserScreenshot;
