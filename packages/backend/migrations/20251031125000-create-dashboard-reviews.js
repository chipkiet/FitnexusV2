// Migration: create dashboard_reviews table for authenticated dashboard feedback

export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      "dashboard_reviews",
      {
        review_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
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
        headline: {
          type: Sequelize.STRING(160),
          allowNull: true,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        rating: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "published",
        },
        ip_address: {
          type: Sequelize.STRING(64),
          allowNull: true,
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

    await queryInterface.addIndex("dashboard_reviews", ["user_id"], {
      name: "dashboard_reviews_user_id_idx",
      transaction,
    });
    await queryInterface.addIndex("dashboard_reviews", ["rating"], {
      name: "dashboard_reviews_rating_idx",
      transaction,
    });
    await queryInterface.addIndex("dashboard_reviews", ["created_at"], {
      name: "dashboard_reviews_created_idx",
      transaction,
    });

    await queryInterface.sequelize.query(
      `
      ALTER TABLE dashboard_reviews
        ADD CONSTRAINT dashboard_reviews_rating_chk CHECK (rating BETWEEN 1 AND 5),
        ADD CONSTRAINT dashboard_reviews_status_chk CHECK (
          status IN ('pending','published','hidden')
        );
      `,
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
    await queryInterface.dropTable("dashboard_reviews", { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

