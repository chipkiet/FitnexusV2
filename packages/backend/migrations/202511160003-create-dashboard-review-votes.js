export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      "dashboard_review_votes",
      {
        vote_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
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
        helpful: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

    await queryInterface.addIndex("dashboard_review_votes", ["review_id"], {
      name: "dashboard_review_votes_review_id_idx",
      transaction,
    });
    await queryInterface.addIndex("dashboard_review_votes", ["user_id"], {
      name: "dashboard_review_votes_user_id_idx",
      transaction,
    });
    await queryInterface.addConstraint("dashboard_review_votes", {
      fields: ["review_id", "user_id"],
      type: "unique",
      name: "dashboard_review_votes_review_user_unique",
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
    await queryInterface.dropTable("dashboard_review_votes", { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
