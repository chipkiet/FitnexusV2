import { sequelize } from '../packages/backend/config/database.js';
async function test() {
    try {
        const res = await sequelize.query('SELECT exercise_id, name, thumbnail_url, gif_demo_url FROM exercises ORDER BY updated_at DESC LIMIT 5');
        console.log(res[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
