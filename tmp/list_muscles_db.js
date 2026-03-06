
import { sequelize } from "../packages/backend/config/database.js";

async function main() {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT muscle_group_id, name_en, slug FROM muscle_groups ORDER BY muscle_group_id");
    console.log(JSON.stringify(results, null, 2));
    await sequelize.close();
}

main();
