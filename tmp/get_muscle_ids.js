
import { sequelize } from '../packages/backend/config/database.js';

async function getMuscleIds() {
    try {
        const [rows] = await sequelize.query('SELECT muscle_group_id, slug, name_en FROM muscle_groups');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

getMuscleIds();
