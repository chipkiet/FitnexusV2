
import { sequelize } from '../packages/backend/config/database.js';

async function testInsert() {
    const t = await sequelize.transaction();
    try {
        const item = {
            slug: "barbell-romanian-deadlift",
            name: "Romanian Deadlift Với Tạ Đòn",
            name_en: "Barbell Romanian Deadlift",
            description: "Bài tập tốt nhất cho đùi sau.",
            difficulty_level: "intermediate",
            exercise_type: "compound",
            equipment_needed: "barbell",
            popularity_score: 95,
            is_public: true,
            source_name: "MuscleWiki",
            instructions: [{ "step_number": 1, "instruction_text": "Cầm thanh đòn rộng bằng vai." }],
            muscles: [
                { "muscle_group_id": 30, "impact_level": "primary" }
            ]
        };

        const [results] = await sequelize.query(
            `
            INSERT INTO exercises (
              slug, name, name_en, description, 
              difficulty_level, exercise_type, equipment_needed,
              popularity_score, is_public, source_name,
              instructions, created_at, updated_at
            ) VALUES (
              :slug, :name, :name_en, :description,
              :difficulty_level, :exercise_type, :equipment_needed,
              :popularity_score, :is_public, :source_name,
              :instructions::jsonb, NOW(), NOW()
            )
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              updated_at = NOW()
            RETURNING exercise_id;
            `,
            {
                replacements: {
                    ...item,
                    instructions: JSON.stringify(item.instructions),
                },
                transaction: t,
            }
        );

        const exerciseId = results[0].exercise_id;
        console.log('Exercise ID:', exerciseId);

        for (const m of item.muscles) {
            await sequelize.query(
                `INSERT INTO exercise_muscle_group (
                  exercise_id, muscle_group_id, impact_level, 
                  created_at
                ) VALUES (:eid, :mid, :impact, NOW())`,
                {
                    replacements: {
                        eid: exerciseId,
                        mid: m.muscle_group_id,
                        impact: m.impact_level || "primary"
                    },
                    transaction: t,
                }
            );
        }
        await t.commit();
        console.log('Success!');
    } catch (error) {
        await t.rollback();
        console.error('FAILED:', error.message);
        if (error.original) console.error('Original:', error.original.message);
    } finally {
        await sequelize.close();
    }
}

testInsert();
