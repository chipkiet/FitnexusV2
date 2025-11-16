import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DashboardReviewComment = sequelize.define(
  "DashboardReviewComment",
  {
    comment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    review_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    display_name: { type: DataTypes.STRING(120), allowNull: false },
    user_role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "USER" },
    content: { type: DataTypes.TEXT, allowNull: false },
    media_urls: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  },
  {
    tableName: "dashboard_review_comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DashboardReviewComment;
