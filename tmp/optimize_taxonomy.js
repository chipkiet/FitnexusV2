
import { sequelize } from "../packages/backend/config/database.js";
import fs from 'fs';

const muscleGroups = [
    // Level 0
    { id: 1, name: "Ngực", slug: "chest", parent_id: null, level: 0 },
    { id: 2, name: "Lưng", slug: "back", parent_id: null, level: 0 },
    { id: 3, name: "Vai", slug: "shoulders", parent_id: null, level: 0 },
    { id: 4, name: "Tay", slug: "arms", parent_id: null, level: 0 },
    { id: 5, name: "Bụng", slug: "core", parent_id: null, level: 0 },
    { id: 6, name: "Chân", slug: "legs", parent_id: null, level: 0 },

    // Level 1 - Chest
    { id: 7, name: "Ngực trên", slug: "upper-chest", parent_id: 1, level: 1 },
    { id: 8, name: "Ngực giữa", slug: "mid-chest", parent_id: 1, level: 1 },
    { id: 9, name: "Ngực dưới", slug: "lower-chest", parent_id: 1, level: 1 },

    // Level 1 - Back
    { id: 10, name: "Cơ xô / Lưng rộng", slug: "lats", parent_id: 2, level: 1 },
    { id: 11, name: "Cầu vai", slug: "traps", parent_id: 2, level: 1 },
    { id: 13, name: "Lưng dưới", slug: "lower-back", parent_id: 2, level: 1 },

    // Level 1 - Shoulders
    { id: 15, name: "Vai trước", slug: "anterior-delts", parent_id: 3, level: 1 },
    { id: 16, name: "Vai giữa", slug: "lateral-delts", parent_id: 3, level: 1 },
    { id: 17, name: "Vai sau", slug: "posterior-delts", parent_id: 3, level: 1 },

    // Level 1 - Arms
    { id: 20, name: "Bắp tay trước", slug: "biceps", parent_id: 4, level: 1 },
    { id: 23, name: "Bắp tay sau", slug: "triceps", parent_id: 4, level: 1 },
    { id: 24, name: "Cẳng tay", slug: "forearms", parent_id: 4, level: 1 },

    // Level 1 - Core
    { id: 26, name: "Cơ bụng", slug: "abs", parent_id: 5, level: 1 },
    { id: 27, name: "Cơ liên sườn", slug: "obliques", parent_id: 5, level: 1 },

    // Level 1 - Legs
    { id: 29, name: "Đùi trước", slug: "quads", parent_id: 6, level: 1 },
    { id: 30, name: "Đùi sau", slug: "hamstrings", parent_id: 6, level: 1 },
    { id: 31, name: "Cơ Mông", slug: "glutes", parent_id: 6, level: 1 },
    { id: 36, name: "Bắp chân", slug: "calves", parent_id: 6, level: 1 }
];

// Mapping for exercise re-assignment
const remap = {
    12: 10, // Rhomboids -> Lats/Back
    14: 10, // Teres Major -> Lats
    18: 16, // Rotator Cuff -> Lateral Delts (approx)
    19: 8,  // Serratus -> Mid Chest (approx)
    21: 20, // Brachialis -> Biceps
    22: 24, // Brachioradialis -> Forearms
    25: 24, // Wrist Extensors -> Forearms
    28: 26, // Transversus -> Abs
    32: 31, // Glute Med -> Glutes
    33: 31, // Glute Min -> Glutes
    34: 29, // Hip Adductors -> Quads/Thighs
    35: 29, // Hip Flexors -> Quads
    37: 36, // Soleus -> Calves
    38: 36  // Tibialis -> Calves/Lower Leg
};

async function run() {
    try {
        await sequelize.authenticate();
        const t = await sequelize.transaction();

        try {
            // 1. Delete old links that will be invalid
            await sequelize.query("DELETE FROM exercise_muscle_group", { transaction: t });

            // 2. Clear and Re-seed Muscle Groups with standard IDs
            await sequelize.query("TRUNCATE TABLE muscle_groups CASCADE", { transaction: t });

            for (const mg of muscleGroups) {
                await sequelize.query(
                    `INSERT INTO muscle_groups (muscle_group_id, name, name_en, slug, level, parent_id, is_selectable, created_at, updated_at) 
                     VALUES (:id, :name, :name, :slug, :level, :parent_id, true, NOW(), NOW())`,
                    { replacements: mg, transaction: t }
                );
            }

            await t.commit();
            console.log("Database taxonomy optimized.");
        } catch (e) {
            await t.rollback();
            throw e;
        }

        // 3. Update JSON files
        const exercisePaths = [
            'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json',
            'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json'
        ];

        for (const p of exercisePaths) {
            if (fs.existsSync(p)) {
                let data = JSON.parse(fs.readFileSync(p, 'utf8'));
                data = data.map(ex => {
                    const newMuscles = [];
                    const seen = new Set();
                    ex.muscles.forEach(m => {
                        let id = m.muscle_group_id;
                        if (remap[id]) id = remap[id];

                        // Check if this ID exists in our new taxonomy
                        if (muscleGroups.some(g => g.id === id) && !seen.has(id)) {
                            newMuscles.push({ ...m, muscle_group_id: id });
                            seen.add(id);
                        }
                    });
                    return { ...ex, muscles: newMuscles };
                });
                fs.writeFileSync(p, JSON.stringify(data, null, 4));
                console.log(`Updated JSON: ${p}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
