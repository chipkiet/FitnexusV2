import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DashboardReviewVote = sequelize.define(
  "DashboardReviewVote",
  {
    vote_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    review_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    helpful: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: "dashboard_review_votes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DashboardReviewVote;
