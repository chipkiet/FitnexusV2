
import fs from "fs";
import path from "path";
import { sequelize } from "../packages/backend/config/database.js"; // Sửa đường dẫn nếu cần

const root = process.cwd();
// Đường dẫn đến file JSON mẫu bạn vừa tạo
const DATA_PATH = path.join(root, "data/exercise/mock_exercise.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Không tìm thấy file dữ liệu tại: ${DATA_PATH}`);
    process.exit(1);
  }

  const exercises = readJson(DATA_PATH);
  await sequelize.authenticate();
  console.log(
    `Kết nối DB thành công. Bắt đầu import ${exercises.length} bài tập...`
  );

  for (const item of exercises) {
    const t = await sequelize.transaction();

    try {
      // 1. Tách dữ liệu: phần bài tập và phần cơ bắp
      const { muscles, ...exData } = item;

      // 2. Upsert (Thêm hoặc Cập nhật) bảng Exercises
      // Sử dụng cú pháp SQL thuần để đảm bảo performance và control tốt nhất với JSONB
      const [results] = await sequelize.query(
        `
        INSERT INTO exercises (
          slug, name, name_en, description, 
          difficulty_level, exercise_type, equipment_needed,
          primary_video_url, thumbnail_url, gif_demo_url,
          duration_minutes, calories_per_rep, popularity_score,
          is_public, is_featured, is_verified, source_name,
          instructions, created_at, updated_at
        ) VALUES (
          :slug, :name, :name_en, :description,
          :difficulty_level, :exercise_type, :equipment_needed,
          :primary_video_url, :thumbnail_url, :gif_demo_url,
          :duration_minutes, :calories_per_rep, :popularity_score,
          :is_public, :is_featured, :is_verified, :source_name,
          :instructions::jsonb, NOW(), NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          name_en = EXCLUDED.name_en,
          description = EXCLUDED.description,
          instructions = EXCLUDED.instructions,
          thumbnail_url = EXCLUDED.thumbnail_url,
          gif_demo_url = EXCLUDED.gif_demo_url,
          popularity_score = EXCLUDED.popularity_score,
          updated_at = NOW()
        RETURNING exercise_id;
        `,
        {
          replacements: {
            ...exData,
            instructions: JSON.stringify(exData.instructions),
          },
          transaction: t,
        }
      );

      const exerciseId = results[0].exercise_id;
      console.log(`> Đã xử lý bài: ${exData.name} (ID: ${exerciseId})`);

      // 3. Xử lý Muscle Groups (Xóa cũ -> Thêm mới để đảm bảo đồng bộ)
      if (muscles && muscles.length > 0) {
        // Xóa liên kết cũ
        await sequelize.query(
          `DELETE FROM exercise_muscle_group WHERE exercise_id = :id`,
          { replacements: { id: exerciseId }, transaction: t }
        );

        // Thêm liên kết mới
        for (const m of muscles) {
          await sequelize.query(
            `
            INSERT INTO exercise_muscle_group (
              exercise_id, muscle_group_id, impact_level, 
              intensity_percentage, activation_note, created_at
            ) VALUES (
              :eid, :mid, :impact, :percent, :note, NOW()
            )
            `,
            {
              replacements: {
                eid: exerciseId,
                mid: m.muscle_group_id,
                impact: m.impact_level || "primary",
                percent: m.intensity_percentage || null,
                note: m.activation_note || null,
              },
              transaction: t,
            }
          );
        }
        console.log(`  - Đã liên kết ${muscles.length} nhóm cơ.`);
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error(`Lỗi khi import bài ${item.slug}:`, error.message);
    }
  }

  console.log("Hoàn tất nhập liệu.");
  await sequelize.close();
}

main();
