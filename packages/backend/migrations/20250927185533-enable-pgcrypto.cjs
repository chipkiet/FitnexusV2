async function up(queryInterface) {
  // Ensure pgcrypto is available for gen_random_uuid()
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
}
async function down() {
  // Do not drop extension on down; may be used elsewhere
}
module.exports = {
  up,
  down
};
