
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const finalGapFiller = [
    {
        "slug": "bicycle-crunches",
        "name": "Gập Bụng Đạp Xe (Bicycle Crunches)",
        "name_en": "Bicycle Crunches",
        "description": "Bài tập tuyệt vời tác động đồng thời vào cơ bụng thẳng và cơ liên sườn.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bicycle-crunch-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm ngửa, tay đặt sau đầu, nhấc vai và chân lên khỏi sàn." },
            { "step_number": 2, "instruction_text": "Co một gối về phía ngực đồng thời xoay người để khuỷu tay đối diện chạm vào gối đó." },
            { "step_number": 3, "instruction_text": "Đổi bên liên tục như đang đạp xe." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "abs", "impact_level": "primary" },
            { "muscle_group_id": 27, "slug_hint": "obliques", "impact_level": "primary" }
        ]
    },
    {
        "slug": "cable-woodchop",
        "name": "Kéo Cáp Chặt Gỗ (Cable Woodchop)",
        "name_en": "Cable Woodchop",
        "description": "Bài tập xoay người mạnh mẽ giúp định hình cơ liên sườn và tăng sức mạnh bùng nổ.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cables-cable-wood-choppers-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng cạnh máy cáp, hai tay nắm tay cầm ở vị trí cao." },
            { "step_number": 2, "instruction_text": "Dùng cơ bụng xoay người kéo cáp xuống theo đường chéo về phía đầu gối đối diện." },
            { "step_number": 3, "instruction_text": "Từ từ đưa cáp trở lại vị trí cũ và lặp lại." }
        ],
        "muscles": [
            { "muscle_group_id": 27, "slug_hint": "obliques", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-reverse-fly",
        "name": "Dang Tạ Tay Ngược (Reverse Fly)",
        "name_en": "Dumbbell Reverse Fly",
        "description": "Bài tập cô lập tốt nhất cho cơ vai sau, giúp vai tròn trịa và cải thiện tư thế.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-reverse-fly-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cúi người về phía trước, lưng thẳng, mỗi tay cầm một quả tạ đơn treo tự nhiên." },
            { "step_number": 2, "instruction_text": "Mở rộng cánh tay sang hai bên (như sải cánh) cho đến khi ngang vai, ép chặt xương bả vai." },
            { "step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 17, "slug_hint": "posterior-delts", "impact_level": "primary" }
        ]
    },
    {
        "slug": "decline-push-ups",
        "name": "Hít Đất Chân Cao (Decline Push-up)",
        "name_en": "Decline Push-ups",
        "description": "Biến thể hít đất tập trung áp lực vào phần ngực trên và vai trước.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "body-weight, bench",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-decline-pushup-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đặt hai bàn chân lên ghế hoặc bục cao, hai tay chống dưới sàn ở tư thế hít đất." },
            { "step_number": 2, "instruction_text": "Hạ thấp ngực xuống gần sàn, giữ cơ thể thẳng." },
            { "step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ." }
        ],
        "muscles": [
            { "muscle_group_id": 7, "slug_hint": "upper-chest", "impact_level": "primary" },
            { "muscle_group_id": 15, "slug_hint": "anterior-delts", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "high-to-low-cable-fly",
        "name": "Ép Cáp Từ Cao Đến Thấp",
        "name_en": "High-to-Low Cable Fly",
        "description": "Bài tập tuyệt vời để nhắm vào sợi cơ ngực dưới.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cables-high-to-low-cable-fly-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng giữa hai máy cáp, tay cầm đặt ở vị trí cao hơn vai." },
            { "step_number": 2, "instruction_text": "Ép hai tay xuống và vào nhau ở phía trước bụng dưới." },
            { "step_number": 3, "instruction_text": "Từ từ mở tay ra để cảm nhận sự kéo giãn của cơ ngực dưới." }
        ],
        "muscles": [
            { "muscle_group_id": 9, "slug_hint": "lower-chest", "impact_level": "primary" }
        ]
    }
];

let mainData = JSON.parse(fs.readFileSync(musclewikiPath, 'utf8'));
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

finalGapFiller.forEach(item => {
    if (!mainData.some(m => m.slug === item.slug)) mainData.push(item);
    if (!mockData.some(m => m.slug === item.slug)) mockData.push(item);
});

fs.writeFileSync(musclewikiPath, JSON.stringify(mainData, null, 4));
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Added ${finalGapFiller.length} gap filler exercises. Total library: ${mainData.length}`);
