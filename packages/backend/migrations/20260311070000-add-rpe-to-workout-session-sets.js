'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('workout_session_sets', 'rpe', {
      type: Sequelize.DECIMAL(4, 1),
      allowNull: true,
      comment: 'Rate of Perceived Exertion (1–10)',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('workout_session_sets', 'rpe');
  },
};
