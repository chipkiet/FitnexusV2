export async function up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.addColumn(
            'plan_exercise_details',
            'target_weight_kg',
            {
                type: Sequelize.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: null,
                comment: 'Target starting weight (kg) as a goal hint for this exercise in the plan'
            },
            { transaction: t }
        );
        console.log('[Migration] ✅ Added column target_weight_kg to plan_exercise_details');
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
        await queryInterface.removeColumn('plan_exercise_details', 'target_weight_kg', { transaction: t });
        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
}
