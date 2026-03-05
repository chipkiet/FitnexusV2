/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Xóa cột isLocked nếu tồn tại
    await queryInterface.removeColumn("users", "isLocked");
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback thì thêm lại cột
    await queryInterface.addColumn("users", "isLocked", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
