
import { sequelize } from "../packages/backend/config/database.js";

async function main() {
    try {
        const [results] = await sequelize.query("SELECT muscle_group_id, name, name_en, slug, parent_id FROM muscle_groups ORDER BY muscle_group_id");
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
main();
