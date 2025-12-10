// packages/backend/models/systemContent.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const SystemContent = sequelize.define(
  "SystemContent",
  {
    key: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(20),
      defaultValue: "json",
    },
    content: {
      type: DataTypes.JSONB, // Quan trọng: JSONB cho Postgres
      allowNull: false,
      defaultValue: {},
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "system_content", // Khớp chính xác tên bảng trong Migration
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SystemContent;
