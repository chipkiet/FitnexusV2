// migrations/20251116000000-create-user-screenshots.js
import { DataTypes } from "sequelize";

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("user_screenshots", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // bảng users hiện tại
        key: "user_id", // khóa chính là user_id
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    object_key: {
      type: DataTypes.STRING(500), // superbase
      allowNull: false,
    },

    feature: {
      type: DataTypes.STRING(50), // aitrainer / ainutrition orther
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    metadata: {
      // Lưu analysis_data, height_cm, v.v...
      type: DataTypes.JSONB,
      allowNull: true,
    },

    is_favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active", // 'active', 'deleted'
    },

    created_at: {
      type: DataTypes.DATE, // timestamp with time zone
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },

    updated_at: {
      type: DataTypes.DATE, // timestamp with time zone
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  // Index theo user_id
  await queryInterface.addIndex("user_screenshots", {
    fields: ["user_id"],
    name: "idx_user_screenshots_user_id",
  });

  // Index theo feature
  await queryInterface.addIndex("user_screenshots", {
    fields: ["feature"],
    name: "idx_user_screenshots_feature",
  });

  // Index theo created_at DESC (phục vụ sort mới nhất)
  await queryInterface.addIndex("user_screenshots", {
    fields: [{ name: "created_at", order: "DESC" }],
    name: "idx_user_screenshots_created_at",
  });
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */
export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "user_screenshots",
    "idx_user_screenshots_created_at"
  );
  await queryInterface.removeIndex(
    "user_screenshots",
    "idx_user_screenshots_feature"
  );
  await queryInterface.removeIndex(
    "user_screenshots",
    "idx_user_screenshots_user_id"
  );

  await queryInterface.dropTable("user_screenshots");
}
