/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("exercise_videos", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    exercise_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "exercises", key: "exercise_id" },
      onDelete: "CASCADE",
    },
    video_url: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    display_order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("NOW()"),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("NOW()"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("exercise_videos");
}
