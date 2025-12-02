import fs from "fs";
import path from "path";
import { sequelize } from "../packages/backend/config/database.js";
import { uploadLocalFileToSupabase } from "../packages/backend/services/upload.service.js";

const root = process.cwd();
const DATA_PATH = path.join(root, "data/exercise/mock_exercise.json");

// Hàm xử lý upload (giữ nguyên)
async function processMedia(value, type) {
  if (!value) return null;
  if (value.startsWith("http")) return value;

  const localPath = path.join(root, "data/exercise", value);
  console.log(`   Uploading ${type}: ${value}...`);

  const publicUrl = await uploadLocalFileToSupabase(
    localPath,
    type === "video" ? "videos" : "images"
  );

  if (publicUrl) {
    console.log(`   -> Uploaded: ${publicUrl}`);
    return publicUrl;
  } else {
    console.warn(`   -> Upload Failed, keeping original value.`);
    return null;
  }
}

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
      // 1. Tách extra_videos ra khỏi object
      const { muscles, extra_videos, ...exData } = item;

      // Xử lý upload media chính
      const cloudThumbnail = await processMedia(item.thumbnail_url, "image");
      const cloudGif = await processMedia(item.gif_demo_url, "image");
      const cloudVideo = await processMedia(item.video_url, "video");

      exData.thumbnail_url = cloudThumbnail || exData.thumbnail_url;
      exData.gif_demo_url = cloudGif || exData.gif_demo_url;
      exData.video_url = cloudVideo || null;

      // 2. Insert/Upsert bảng Exercises
      // Đã sửa lỗi thiếu dấu phẩy ở phần VALUES
      const [results] = await sequelize.query(
        `
        INSERT INTO exercises (
          slug, name, name_en, description, 
          difficulty_level, exercise_type, equipment_needed, video_url,
          primary_video_url, thumbnail_url, gif_demo_url,
          duration_minutes, calories_per_rep, popularity_score,
          is_public, is_featured, is_verified, source_name,
          instructions, created_at, updated_at
        ) VALUES (
          :slug, :name, :name_en, :description,
          :difficulty_level, :exercise_type, :equipment_needed, :video_url,
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
          video_url = EXCLUDED.video_url,
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

      // 3. Xử lý Muscle Groups (Giữ nguyên)
      if (muscles && muscles.length > 0) {
        await sequelize.query(
          `DELETE FROM exercise_muscle_group WHERE exercise_id = :id`,
          { replacements: { id: exerciseId }, transaction: t }
        );

        for (const m of muscles) {
          await sequelize.query(
            `INSERT INTO exercise_muscle_group (
              exercise_id, muscle_group_id, impact_level, 
              intensity_percentage, activation_note, created_at
            ) VALUES (:eid, :mid, :impact, :percent, :note, NOW())`,
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

      // 4. Xử lý Extra Videos (MỚI THÊM)
      if (
        extra_videos &&
        Array.isArray(extra_videos) &&
        extra_videos.length > 0
      ) {
        // Xóa video cũ để tránh trùng lặp khi chạy lại script
        await sequelize.query(
          `DELETE FROM exercise_videos WHERE exercise_id = :id`,
          { replacements: { id: exerciseId }, transaction: t }
        );

        let orderIndex = 0;
        for (const vid of extra_videos) {
          // Upload video phụ lên Cloud
          const extraVideoUrl = await processMedia(vid.file, "video");

          if (extraVideoUrl) {
            await sequelize.query(
              `INSERT INTO exercise_videos (
                exercise_id, video_url, title, display_order, created_at, updated_at
              ) VALUES (:eid, :url, :title, :order, NOW(), NOW())`,
              {
                replacements: {
                  eid: exerciseId,
                  url: extraVideoUrl,
                  title: vid.title || `Góc quay ${orderIndex + 1}`,
                  order: orderIndex,
                },
                transaction: t,
              }
            );
            orderIndex++;
          }
        }
        console.log(`  - Đã thêm ${orderIndex} video phụ.`);
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
