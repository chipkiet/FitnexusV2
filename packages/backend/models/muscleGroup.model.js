import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const MuscleGroup = sequelize.define(
  "MuscleGroup",
  {
    muscle_group_id: {
      // Khóa chính trong DB của bạn
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    parent_id :{ 
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  },
  {
    tableName: "muscle_groups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default MuscleGroup;
