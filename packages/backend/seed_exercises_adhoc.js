import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Exercise from './models/exercise.model.js';
import MuscleGroup from './models/muscleGroup.model.js';
import { sequelize } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedExercises() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const dataPath = path.join(__dirname, '../../data/xwalk/xwalk_exercise.import.json');
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const exercises = JSON.parse(rawData);
    console.log(`Found ${exercises.length} exercises in JSON.`);

    // Pre-fetch all muscle groups for mapping
    const muscles = await MuscleGroup.findAll();
    const muscleSlugMap = new Map();
    muscles.forEach((m) => {
      muscleSlugMap.set(m.slug, m.muscle_group_id);
    });

    const t = await sequelize.transaction();

    try {
      let count = 0;
      for (const item of exercises) {
        // Create exercise
        const [exercise, created] = await Exercise.findOrCreate({
          where: { slug: item.slug },
          defaults: {
            name: item.name,
            name_en: item.name_en,
            description: item.description,
            gif_demo_url: item.gif_demo_url,
            primary_video_url: item.primary_video_url,
            thumbnail_url: item.thumbnail_url,
            equipment_needed: item.equipment_needed,
            popularity_score: item.popularity_score || 0,
            is_public: true,
            is_featured: false,
          },
          transaction: t
        });

        if (created) count++;

        // Map primary muscles
        const primarySlugs = item.target_muscle_slugs || [];
        for (const slug of primarySlugs) {
          const muscleId = muscleSlugMap.get(slug);
          if (muscleId) {
            await sequelize.query(
              `INSERT INTO exercise_muscle_group (exercise_id, muscle_group_id, impact_level, created_at)
               VALUES (:exercise_id, :muscle_id, 'primary', NOW())
               ON CONFLICT DO NOTHING`,
              {
                replacements: { exercise_id: exercise.exercise_id, muscle_id: muscleId },
                transaction: t
              }
            );
          }
        }

        // Map secondary muscles
        const secondarySlugs = item.secondary_muscle_slugs || [];
        for (const slug of secondarySlugs) {
          const muscleId = muscleSlugMap.get(slug);
          if (muscleId) {
            await sequelize.query(
              `INSERT INTO exercise_muscle_group (exercise_id, muscle_group_id, impact_level, created_at)
               VALUES (:exercise_id, :muscle_id, 'secondary', NOW())
               ON CONFLICT DO NOTHING`,
              {
                replacements: { exercise_id: exercise.exercise_id, muscle_id: muscleId },
                transaction: t
              }
            );
          }
        }
      }

      await t.commit();
      console.log(`Seeded ${count} new exercises successfully.`);
    } catch (err) {
      await t.rollback();
      throw err;
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedExercises();
