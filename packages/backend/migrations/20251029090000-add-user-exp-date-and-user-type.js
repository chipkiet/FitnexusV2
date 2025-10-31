export async function up(queryInterface, Sequelize) {
  // Add user_exp_date: subscription or account expiration date
  await queryInterface.addColumn("users", "user_exp_date", {
    type: Sequelize.DATE,
    allowNull: true,
  });

  // Add user_type: generic classification string (kept flexible)
  await queryInterface.addColumn("users", "user_type", {
    type: Sequelize.STRING(32),
    allowNull: true,
  });

  // Optional indexes to support lookups/filtering
  await queryInterface.addIndex("users", ["user_exp_date"], {
    name: "users_user_exp_date_idx",
  });

  await queryInterface.addIndex("users", ["user_type"], {
    name: "users_user_type_idx",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeIndex("users", "users_user_type_idx").catch(() => {});
  await queryInterface.removeIndex("users", "users_user_exp_date_idx").catch(() => {});
  await queryInterface.removeColumn("users", "user_type");
  await queryInterface.removeColumn("users", "user_exp_date");
}

