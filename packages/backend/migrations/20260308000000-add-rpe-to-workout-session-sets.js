export async function up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.addColumn(
            'workout_session_sets',
            'rpe',
            {
                type: Sequelize.DECIMAL(4, 1),
                allowNull: true,
                defaultValue: null,
                comment: 'Rate of Perceived Exertion (1-10)'
            },
            { transaction: t }
        );
        console.log('[Migration] ✅ Added column rpe to workout_session_sets');
        await t.commit();
    } catch (err) {
        await t.rollback();
        console.error('[Migration] ❌ Error adding rpe column:', err.message);
        throw err;
    }
}

export async function down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.removeColumn('workout_session_sets', 'rpe', { transaction: t });
        console.log('[Migration] ✅ Removed column rpe from workout_session_sets');
        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
}
