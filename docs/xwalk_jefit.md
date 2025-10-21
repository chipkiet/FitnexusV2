# JEFIT → FitNexus X‑Walk (Exercises + Steps)

Mục tiêu: Chuẩn hoá dữ liệu bài tập (tiếng Việt) lấy từ JEFIT để nhập vào các bảng `exercises`, `exercise_muscle_group`, và `exercise_steps` của hệ thống. Bản thiết kế này mô tả chuẩn x‑walk, quy tắc định danh, ánh xạ field, và pipeline tạo file import.

## Đầu Vào (JEFIT)
- Bản ghi bài tập gồm (điển hình):
  - id (định danh provider), name (EN), muscle(s), secondary muscle(s), equipment, mechanics, force, images/gifs, video, instructions (text step hoặc đoạn dài), tips.

## Định Danh/Tiêu Chuẩn Hóa
- slug: tạo từ `name_en` bằng cách lower-case, bỏ dấu/ ký tự đặc biệt, thay khoảng trắng bằng `-`. Nếu JEFIT có slug sẵn thì ưu tiên dùng.
- name_en: tên gốc tiếng Anh từ JEFIT.
- name: tên tiếng Việt (dịch thủ công/offline). Nếu chưa có bản dịch → tạm dùng `name_en` và cập nhật sau.
- Trùng/đồng nhất:
  1. Tìm theo `slug` (chính xác).
  2. Nếu không có, ILIKE theo `name_en` (không phân biệt hoa thường, bỏ dấu).
  3. Nếu không có, ILIKE theo `name` (VI). Nếu vẫn không có → tạo mới.

## Ánh Xạ Trường (Exercises)
- FitNexus ← JEFIT
  - exercises.slug ← slug(name_en)
  - exercises.name_en ← name (EN)
  - exercises.name ← name (VI)
  - exercises.description ← mô tả VI (nếu chỉ có EN: lưu tạm EN rồi cập nhật sau)
  - exercises.thumbnail_url / gif_demo_url / primary_video_url ← media (ưu tiên thumbnail → gif → video)
  - exercises.equipment_needed ← map từ equipment của JEFIT (xem “Ánh xạ Equipment”)
  - exercises.exercise_type ← map từ mechanics/force/type (compound/isolation/cardio)
  - exercises.difficulty_level ← map từ difficulty (beginner/intermediate/advanced)
  - Liên kết cơ (`exercise_muscle_group`):
    - primary: `impact_level = 'primary'`
    - secondary: `impact_level = 'secondary'`

## Ánh Xạ Cơ (JEFIT → Canonical Slugs)
- Sử dụng file: `data/xwalk/muscle_alias_map.json` + mở rộng riêng cho JEFIT tại `data/xwalk/providers/jefit/muscle_alias_map.jefit.json`.
- Một số ví dụ (JEFIT → canonical):
  - Abs/Abdominals → `rectus-abdominis`
  - Obliques → `obliques`
  - Lower Back → `erector-spinae`
  - Upper Back → `rhomboids` (hoặc `trapezius` tuỳ ngữ cảnh)
  - Lats → `latissimus-dorsi`
  - Traps → `trapezius`
  - Shoulders/Front Delts/Rear Delts → `anterior-deltoid`/`posterior-deltoid`/`lateral-deltoid`
  - Biceps → `biceps-brachii`
  - Triceps → `triceps-brachii`
  - Forearms → `wrist-flexors`, `wrist-extensors`
  - Glutes → `gluteus-maximus`
  - Quadriceps → `quadriceps`
  - Hamstrings → `hamstrings`
  - Calves → `gastrocnemius`, `soleus`
  - Hip Flexors → `hip-flexors`
  - Adductors → `hip-adductors`
  - Abductors → `gluteus-medius`

## Ánh Xạ Equipment (ví dụ)
- Barbell → `barbell`
- Dumbbell → `dumbbell`
- Cable → `cable`
- Machine/Smith Machine → `machine`
- Body Only/Bodyweight → `bodyweight`
- Kettlebell → `kettlebell`
- Bands → `band`
- Medicine Ball → `medicine-ball`
- Exercise/Swiss Ball → `stability-ball`
- EZ‑Bar → `barbell` (hoặc `ez-bar` nếu muốn chi tiết)

## Ánh Xạ Difficulty / Type
- Difficulty: Beginner → `beginner`, Intermediate → `intermediate`, Advanced → `advanced`.
- Type: Compound/Isolation/Cardio/Flexibility → map sang `exercise_type` cùng giá trị.

## Steps (exercise_steps)
- Trích xuất từ phần Instructions của JEFIT:
  - Nếu ở dạng đoạn dài: tách bước theo số thứ tự ("1.", "2."), dấu gạch đầu dòng, hoặc xuống dòng kép.
  - Lưu mỗi bước vào `exercise_steps`:
    - `exercise_id`: tra theo slug/name_en
    - `step_number`: số thứ tự (1..N)
    - `instruction_text`: tiếng Việt (dịch), tạm thời có thể giữ EN và cập nhật sau.
    - `title`, `media_url`, `media_type`: nếu có.

## Định Dạng File Normalized/Import
- Normalized exercises (ví dụ): `data/xwalk/providers/jefit/exercises.normalized.json`
  ```json
  {
    "provider": "jefit",
    "provider_id": "12345",
    "slug": "barbell-bench-press",
    "name_en": "Barbell Bench Press",
    "name": "Đẩy ngực với tạ đòn",
    "description": "Bài đẩy ngực cơ bản...",
    "thumbnail_url": "https://.../thumb.jpg",
    "gif_url": "https://.../demo.gif",
    "video_url": "https://.../video.mp4",
    "equipment_key": "barbell",
    "primary_muscle_aliases": ["chest"],
    "secondary_muscle_aliases": ["triceps", "front-delts"],
    "target_muscle_slugs": ["mid-chest"],
    "secondary_muscle_slugs": ["triceps-brachii", "anterior-deltoid"],
    "difficulty": "beginner",
    "exercise_type": "compound"
  }
  ```

- Import exercises (đầu vào cho `scripts/import_exercises.js`): `data/xwalk/xwalk_exercise.import.json`
  ```json
  {
    "slug": "barbell-bench-press",
    "name": "Đẩy ngực với tạ đòn",
    "name_en": "Barbell Bench Press",
    "description": "...",
    "gif_demo_url": "https://.../demo.gif",
    "primary_video_url": "https://.../video.mp4",
    "thumbnail_url": "https://.../thumb.jpg",
    "equipment_needed": "barbell",
    "target_muscle_slugs": ["mid-chest"],
    "secondary_muscle_slugs": ["triceps-brachii", "anterior-deltoid"]
  }
  ```

- Steps import (đầu vào mới cho script nhập steps): `data/xwalk/xwalk_exercise_steps.import.json`
  ```json
  {
    "slug": "barbell-bench-press",
    "steps": [
      { "step_number": 1, "instruction_text": "Nằm trên ghế phẳng, tay nắm tạ đòn rộng hơn vai..." },
      { "step_number": 2, "instruction_text": "Hạ tạ chậm xuống phần giữa ngực..." },
      { "step_number": 3, "instruction_text": "Đẩy tạ lên mạnh mẽ, thở ra..." }
    ]
  }
  ```

## Pipeline Đề Xuất
1. Thu thập dữ liệu JEFIT (CSV/JSON scrape/export) ngoại tuyến.
2. Chuẩn hoá sang normalized (tiếng Việt) và ánh xạ cơ qua canonical slugs:
   - Viết script: `scripts/xwalk/jefit.normalize.mjs`
   - Đầu ra: `data/xwalk/providers/jefit/exercises.normalized.json`
3. Tạo file import exercises cho script sẵn có:
   - Tận dụng `scripts/normalize_exercise_muscles.js` hoặc `scripts/xwalk/jefit.to_import.mjs`
   - Đầu ra: `data/xwalk/xwalk_exercise.import.json`
4. Nhập exercises + cơ vào DB:
   - `node scripts/import_exercises.js`
5. Tạo file steps import:
   - Đầu ra: `data/xwalk/xwalk_exercise_steps.import.json`
6. Nhập steps vào DB (script mới – xem bên dưới):
   - `node scripts/import_exercise_steps.js`

## Script Import Steps (đề xuất)
- Tạo `scripts/import_exercise_steps.js`:
  - Đọc `data/xwalk/xwalk_exercise_steps.import.json`
  - Với mỗi bản ghi: tra `exercise_id` theo `slug` (fallback theo `name_en/name` nếu cần)
  - Xoá/cập nhật lại `exercise_steps` của bài tập, sau đó `INSERT` theo `step_number`.
  - Đảm bảo unique `(exercise_id, step_number)` (migr đã có ràng buộc).

## Lưu Ý Dịch Thuật
- Dữ liệu tiếng Việt ưu tiên nhập trực tiếp (dịch offline). Nếu chưa có, pipeline lưu EN và đánh dấu để cập nhật sau.
- Có thể thêm trường phụ: `name_vi`, `description_vi` trong normalized và kết hợp vào `name/description` khi import.

---
Tài liệu này đủ để hiện thực hoá x‑walk JEFIT → FitNexus mà không cần truy cập mạng trong môi trường runtime. Khi có bộ dữ liệu JEFIT cụ thể, chỉ cần bổ sung/điều chỉnh alias map và bộ chuyển đổi tương ứng trong script normalize.

