/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("system_content", {
    key: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING(50),
    },

    type: {
      type: Sequelize.STRING(20),
      defaultValue: "json",
    },
    content: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
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
    updated_by: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key : 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
  });

  await queryInterface.bulkInsert("system_content", [
    {
      key: "dashboard_hero",
      type: "json",
      content: JSON.stringify({
        mediaType: "video",
        mediaUrl: "/vidbgr.mp4",
        title:
          'Trải nghiệm <span class="text-blue-400">AI Workout</span><br>cùng Fitnexus',
        description:
          "Kết hợp AI, mô hình hoá chuyển động và lộ trình cá nhân hóa.",
        buttonText: "Bắt đầu ngay",
        showButton: true,
      }),
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: null,
    },
  ]);
}



export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("system_content");
}
