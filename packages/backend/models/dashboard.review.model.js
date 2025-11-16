import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DashboardReview = sequelize.define(
  "DashboardReview",
  {
    review_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    display_name: { type: DataTypes.STRING(120), allowNull: false },
    headline: { type: DataTypes.STRING(160), allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    program: { type: DataTypes.STRING(160), allowNull: true },
    tags: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    media_urls: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    helpful_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    comment_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "published" },
    ip_address: { type: DataTypes.STRING(64), allowNull: true },
  },
  {
    tableName: "dashboard_reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default DashboardReview;
