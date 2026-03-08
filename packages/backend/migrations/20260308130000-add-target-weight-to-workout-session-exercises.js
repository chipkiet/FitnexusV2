export async function up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.addColumn(
            'workout_session_exercises',
            'target_weight_kg',
            {
                type: Sequelize.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: null,
                comment: 'Target weight copied from plan_exercise_details at session creation time'
            },
            { transaction: t }
        );
        console.log('[Migration] ✅ Added column target_weight_kg to workout_session_exercises');
        await t.commit();
    } catch (err) {
        await t.rollback();
        console.error('[Migration] ❌ Error:', err.message);
        throw err;
    }
}

export async function down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.removeColumn('workout_session_exercises', 'target_weight_kg', { transaction: t });
        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
}
