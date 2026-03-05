async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'onboarding_completed_at', {
    type: Sequelize.DATE,
    allowNull: true,
  });
}
async function down(queryInterface) {
  await queryInterface.removeColumn('users', 'onboarding_completed_at');
}
module.exports = {
  up,
  down
};
