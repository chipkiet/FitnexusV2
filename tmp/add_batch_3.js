
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newExercises = [
    {
        "slug": "laying-leg-raises",
        "name": "Nằm Nhấc Chân (Leg Raises)",
        "name_en": "Laying Leg Raises",
        "description": "Bài tập tuyệt vời để tác động vào cơ bụng dưới.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-leg-raises-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm ngửa trên sàn, hai tay đặt dưới mông hoặc hai bên hông để hỗ trợ." },
            { "step_number": 2, "instruction_text": "Giữ chân thẳng, từ từ nhấc chân lên cho đến khi vuông góc với sàn." },
            { "step_number": 3, "instruction_text": "Hạ chân xuống từ từ nhưng không chạm sàn để duy trì áp lực lên cơ bụng." }
        ],
        "muscles": [{ "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }]
    },
    {
        "slug": "forearm-plank",
        "name": "Plank Cẳng Tay (Forearm Plank)",
        "name_en": "Forearm Plank",
        "description": "Bài tập nền tảng giúp xây dựng sức bền cơ trọng tâm (core) và ổn định toàn thân.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-forearm-plank-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Tựa người trên cẳng tay và mũi chân, giữ khuỷu tay ngay dưới vai." },
            { "step_number": 2, "instruction_text": "Giữ cơ thể thành một đường thẳng từ đầu đến gót chân." },
            { "step_number": 3, "instruction_text": "Gồng cơ bụng và giữ tư thế trong thời gian quy định." }
        ],
        "muscles": [{ "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }]
    },
    {
        "slug": "machine-standing-calf-raises",
        "name": "Nhón Bắp Chân Đứng Với Máy",
        "name_en": "Machine Standing Calf Raises",
        "description": "Bài tập phát triển cơ bắp chân (gastrocnemius) mạnh mẽ.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-standing-calf-raise-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng vào máy, đặt vai dưới đệm và mũi chân trên bục." },
            { "step_number": 2, "instruction_text": "Nhón gót chân lên cao nhất có thể, siết chặt cơ bắp chân." },
            { "step_number": 3, "instruction_text": "Hạ gót chân xuống dưới mức bục để kéo giãn cơ tối đa." }
        ],
        "muscles": [{ "muscle_group_id": 36, "slug_hint": "gastrocnemius", "impact_level": "primary" }]
    },
    {
        "slug": "dumbbell-shrug",
        "name": "Nhún Cầu Vai Với Tạ Tay",
        "name_en": "Dumbbell Shrug",
        "description": "Bài tập tập trung vào cơ cầu vai trên (traps).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-shrug-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn ở hai bên hông." },
            { "step_number": 2, "instruction_text": "Nhún vai lên cao về phía tai mà không uốn cong khuỷu tay." },
            { "step_number": 3, "instruction_text": "Giữ một giây ở điểm cao nhất rồi từ từ hạ xuống." }
        ],
        "muscles": [{ "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "primary" }]
    },
    {
        "slug": "barbell-upright-row",
        "name": "Kéo Tạ Đòn Thẳng Đứng (Upright Row)",
        "name_en": "Barbell Upright Row",
        "description": "Bài tập phát triển cơ cầu vai và cơ vai giữa.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "barbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-upright-row-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm thanh tạ đòn với khoảng cách hai tay hẹp hơn vai." },
            { "step_number": 2, "instruction_text": "Kéo thanh tạ thẳng lên dọc theo cơ thể cho đến khi gần chạm cằm, khuỷu tay hướng ra ngoài và lên cao." },
            { "step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "primary" },
            { "muscle_group_id": 16, "slug_hint": "lateral-deltoid", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "barbell-behind-the-back-wrist-curl",
        "name": "Cuốn Cổ Tay Tạ Đòn Sau Lưng",
        "name_en": "Barbell Behind The Back Wrist Curl",
        "description": "Bài tập chuyên sâu cho cơ cẳng tay.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "barbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-behind-back-wrist-curl-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn ở phía sau lưng với lòng bàn tay hướng ra xa." },
            { "step_number": 2, "instruction_text": "Chỉ sử dụng cổ tay để cuốn thanh tạ lên cao nhất có thể." },
            { "step_number": 3, "instruction_text": "Hạ tạ xuống từ từ và lặp lại." }
        ],
        "muscles": [{ "muscle_group_id": 24, "slug_hint": "wrist-flexors", "impact_level": "primary" }]
    },
    {
        "slug": "barbell-skull-crusher",
        "name": "Nằm Đẩy Tạ Đòn Sau Đầu (Skull Crusher)",
        "name_en": "Barbell Skull Crusher",
        "description": "Một trong những bài tập tốt nhất để xây dựng kích thước cho cơ tam đầu (triceps).",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "barbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-skull-crusher-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế phẳng, cầm thanh tạ đòn (thường là thanh EZ) thẳng trên ngực." },
            { "step_number": 2, "instruction_text": "Giữ bắp tay cố định, gập khuỷu tay để hạ thanh tạ về phía trán." },
            { "step_number": 3, "instruction_text": "Dùng cơ tay sau đẩy thanh tạ trở lại vị trí ban đầu." }
        ],
        "muscles": [{ "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "primary" }]
    }
];

let mainData = JSON.parse(fs.readFileSync(musclewikiPath, 'utf8'));
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

newExercises.forEach(item => {
    if (!mainData.some(m => m.slug === item.slug)) mainData.push(item);
    if (!mockData.some(m => m.slug === item.slug)) mockData.push(item);
});

fs.writeFileSync(musclewikiPath, JSON.stringify(mainData, null, 4));
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Added ${newExercises.length} diverse exercises.`);
