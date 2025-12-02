export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("exercises", "video_url", {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: "Link video MP4/M3U8 được host trên Cloud (AWS/Cloudinary)",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("exercises", "video_url");
}
