export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      "dashboard_review_comments",
      {
        comment_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        review_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "dashboard_reviews", key: "review_id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "users", key: "user_id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        display_name: {
          type: Sequelize.STRING(120),
          allowNull: false,
        },
        user_role: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "USER",
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        media_urls: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: Sequelize.literal("'[]'::jsonb"),
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      { transaction }
    );

    await queryInterface.addIndex("dashboard_review_comments", ["review_id"], {
      name: "dashboard_review_comments_review_id_idx",
      transaction,
    });
    await queryInterface.addIndex("dashboard_review_comments", ["user_id"], {
      name: "dashboard_review_comments_user_id_idx",
      transaction,
    });
    await queryInterface.addIndex("dashboard_review_comments", ["created_at"], {
      name: "dashboard_review_comments_created_idx",
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.dropTable("dashboard_review_comments", { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
