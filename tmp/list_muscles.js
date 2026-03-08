
import { sequelize } from '../packages/backend/config/database.js';

async function listMuscles() {
    try {
        const [rows] = await sequelize.query('SELECT muscle_group_id, name_en, slug FROM muscle_groups ORDER BY muscle_group_id');
        rows.forEach(r => console.log(`${r.muscle_group_id}: ${r.slug}`));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

listMuscles();
