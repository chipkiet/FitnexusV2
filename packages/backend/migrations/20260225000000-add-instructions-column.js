export async function up(queryInterface, Sequelize) {
  const t = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.addColumn(
      'exercises',
      'instructions',
      {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      { transaction: t }
    );
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function down(queryInterface) {
  const t = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.removeColumn('exercises', 'instructions', { transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}
