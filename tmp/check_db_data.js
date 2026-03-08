
import { sequelize } from '../packages/backend/config/database.js';

async function checkData() {
    try {
        const [exerciseCount] = await sequelize.query('SELECT COUNT(*) FROM exercises');
        const [muscleGroupCount] = await sequelize.query('SELECT COUNT(*) FROM muscle_groups');
        const [linkCount] = await sequelize.query('SELECT COUNT(*) FROM exercise_muscle_group');

        console.log('Exercises:', exerciseCount[0].count);
        console.log('Muscle Groups:', muscleGroupCount[0].count);
        console.log('Links:', linkCount[0].count);

        const [exercises] = await sequelize.query('SELECT name, slug FROM exercises LIMIT 5');
        console.log('Sample Exercises:', exercises);

        const [legsGroup] = await sequelize.query("SELECT muscle_group_id FROM muscle_groups WHERE slug = 'legs'");
        if (legsGroup.length > 0) {
            const legsId = legsGroup[0].muscle_group_id;
            const [childGroups] = await sequelize.query("SELECT muscle_group_id, name, slug FROM muscle_groups WHERE parent_id = :id", { replacements: { id: legsId } });
            console.log('Child groups for Legs:', childGroups);

            const childIds = childGroups.map(c => c.muscle_group_id);
            if (childIds.length > 0) {
                const [exercisesInLegs] = await sequelize.query("SELECT COUNT(*) FROM exercise_muscle_group WHERE muscle_group_id IN (:ids)", { replacements: { ids: childIds } });
                console.log('Exercises linked to Legs children:', exercisesInLegs[0].count);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkData();
