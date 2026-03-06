
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newExercises = [
    {
        "slug": "burpees",
        "name": "Burpees (Nhảy Hít Đất)",
        "name_en": "Burpees",
        "description": "Bài tập toàn thân đốt mỡ đỉnh cao, kết hợp giữa hít đất và bật nhảy.",
        "difficulty_level": "advanced",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-burpees-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Từ tư thế đứng, hạ người xuống tư thế squat và đặt hai tay xuống sàn." },
            { "step_number": 2, "instruction_text": "Bật hai chân ra sau về tư thế chống đẩy, thực hiện một lần hít đất." },
            { "step_number": 3, "instruction_text": "Bật chân trở lại tư thế squat và nhảy cao lên, đưa tay qua đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" },
            { "muscle_group_id": 29, "slug_hint": "quadriceps", "impact_level": "primary" },
            { "muscle_group_id": 1, "slug_hint": "chest", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "superman",
        "name": "Siêu Nhân (Superman)",
        "name_en": "Superman",
        "description": "Bài tập tuyệt vời cho lưng dưới và mông mà không cần thiết bị.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-supermans-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm sấp trên sàn, hai tay duỗi thẳng về phía trước." },
            { "step_number": 2, "instruction_text": "Đồng thời nhấc tay, ngực và chân lên khỏi sàn cao nhất có thể." },
            { "step_number": 3, "instruction_text": "Giữ trong 2-3 giây rồi từ từ hạ xuống." }
        ],
        "muscles": [
            { "muscle_group_id": 13, "slug_hint": "erector-spinae", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "bodyweight-glute-bridge",
        "name": "Cầu Mông (Glute Bridge)",
        "name_en": "Bodyweight Glute Bridge",
        "description": "Bài tập kích hoạt cơ mông và bảo vệ lưng dưới.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-glute-bridge-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm ngửa, đầu gối gập và bàn chân đặt phẳng trên sàn." },
            { "step_number": 2, "instruction_text": "Đẩy gót chân để nâng hông lên cho đến khi cơ thể tạo đường thẳng từ vai đến đầu gối." },
            { "step_number": 3, "instruction_text": "Siết chặt mông ở đỉnh và từ từ hạ xuống." }
        ],
        "muscles": [{ "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" }]
    },
    {
        "slug": "bodyweight-fire-hydrants",
        "name": "Đá Chân Sang Bên (Fire Hydrant)",
        "name_en": "Fire Hydrant",
        "description": "Bài tập tuyệt vời để tác động vào cơ mông nhỡ và mông nhỏ.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-fire-hydrant-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Bắt đầu ở tư thế quỳ bằng hai tay và hai đầu gối." },
            { "step_number": 2, "instruction_text": "Nâng một chân sang bên cạnh trong khi vẫn giữ đầu gối gập 90 độ." },
            { "step_number": 3, "instruction_text": "Hạ chân xuống và lặp lại." }
        ],
        "muscles": [{ "muscle_group_id": 32, "slug_hint": "gluteus-medius", "impact_level": "primary" }]
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

console.log(`Added final 4. Total: ${mainData.length}`);
