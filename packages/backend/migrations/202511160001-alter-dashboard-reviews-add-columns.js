export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.addColumn(
      "dashboard_reviews",
      "program",
      { type: Sequelize.STRING(160), allowNull: true },
      { transaction }
    );
    await queryInterface.addColumn(
      "dashboard_reviews",
      "tags",
      {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      { transaction }
    );
    await queryInterface.addColumn(
      "dashboard_reviews",
      "media_urls",
      {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      { transaction }
    );
    await queryInterface.addColumn(
      "dashboard_reviews",
      "helpful_count",
      { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      { transaction }
    );
    await queryInterface.addColumn(
      "dashboard_reviews",
      "comment_count",
      { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      { transaction }
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.removeColumn("dashboard_reviews", "program", { transaction });
    await queryInterface.removeColumn("dashboard_reviews", "tags", { transaction });
    await queryInterface.removeColumn("dashboard_reviews", "media_urls", { transaction });
    await queryInterface.removeColumn("dashboard_reviews", "helpful_count", { transaction });
    await queryInterface.removeColumn("dashboard_reviews", "comment_count", { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
