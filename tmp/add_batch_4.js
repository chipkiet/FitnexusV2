
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newExercises = [
    {
        "slug": "hanging-knee-raises",
        "name": "Treo Người Co Gối (Hanging Knee Raises)",
        "name_en": "Hanging Knee Raises",
        "description": "Bài tập cơ bụng dưới hiệu quả cao, giúp tăng cường sức mạnh bám nắm.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-knee-raises-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Treo người trên thanh xà, hai tay rộng bằng vai." },
            { "step_number": 2, "instruction_text": "Dùng cơ bụng kéo đầu gối lên cao về phía ngực." },
            { "step_number": 3, "instruction_text": "Từ từ hạ chân xuống vị trí ban đầu mà không để cơ thể đung đưa." }
        ],
        "muscles": [{ "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }]
    },
    {
        "slug": "mountain-climber",
        "name": "Leo Núi Tại Chỗ (Mountain Climber)",
        "name_en": "Mountain Climber",
        "description": "Bài tập cardio và cơ bụng kết hợp, giúp đốt cháy mỡ thừa và tăng sức bền.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-mountain-climbers-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Bắt đầu ở tư thế chống đẩy cao (plank cao)." },
            { "step_number": 2, "instruction_text": "Kéo đầu gối một chân về phía ngực nhanh nhất có thể, sau đó đưa về và đổi chân." },
            { "step_number": 3, "instruction_text": "Lặp lại động tác liên tục như đang chạy bộ ở tư thế nằm." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" },
            { "muscle_group_id": 5, "slug_hint": "core", "impact_level": "primary" }
        ]
    },
    {
        "slug": "hollow-hold",
        "name": "Giữ Thân Hình Chuối (Hollow Hold)",
        "name_en": "Hollow Hold",
        "description": "Bài tập nền tảng trong Calisthenics giúp nén cơ bụng và tạo độ cứng cho cơ trọng tâm.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hollow-hold-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm ngửa trên sàn, tay duỗi thẳng qua đầu." },
            { "step_number": 2, "instruction_text": "Đồng thời nhấc chân, vai và tay lên khỏi sàn khoảng 15-20cm, ép chặt lưng dưới xuống sàn." },
            { "step_number": 3, "instruction_text": "Giữ tư thế này lâu nhất có thể." }
        ],
        "muscles": [{ "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }]
    },
    {
        "slug": "kettlebell-calf-raise",
        "name": "Nhón Bắp Chân Với Tạ Ấm",
        "name_en": "Kettlebell Calf Raise",
        "description": "Bài tập bắp chân linh hoạt sử dụng tạ ấm.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "kettlebell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Kettlebells-kettlebell-calf-raise-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ ấm." },
            { "step_number": 2, "instruction_text": "Nhón gót chân lên cao tối đa, giữ thăng bằng." },
            { "step_number": 3, "instruction_text": "Hạ xuống từ từ và lặp lại." }
        ],
        "muscles": [{ "muscle_group_id": 36, "slug_hint": "gastrocnemius", "impact_level": "primary" }]
    },
    {
        "slug": "cable-bicep-curl",
        "name": "Cuốn Tay Trước Với Cáp",
        "name_en": "Cable Bicep Curl",
        "description": "Duy trì áp lực liên tục lên cơ nhị đầu trong suốt biên độ chuyển động.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-bicep-curl-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nắm thanh xà của máy cáp, đặt ở vị trí thấp." },
            { "step_number": 2, "instruction_text": "Cuốn thanh xà lên về phía ngực, giữ khuỷu tay sát sườn." },
            { "step_number": 3, "instruction_text": "Hạ xuống từ từ có kiểm soát." }
        ],
        "muscles": [{ "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "primary" }]
    },
    {
        "slug": "tricep-dips",
        "name": "Chống Xà Kép Tập Tay Sau",
        "name_en": "Tricep Dips",
        "description": "Bài tập sức mạnh thân trên tập trung tối đa vào cơ tam đầu.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-tricep-dip-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Chống hai tay lên xà kép, giữ thân người thẳng đứng (không nghiêng như tập ngực)." },
            { "step_number": 2, "instruction_text": "Hạ thấp người xuống bằng cách gập khuỷu tay cho đến khi bắp tay song song với sàn." },
            { "step_number": 3, "instruction_text": "Đẩy mạnh người lên trở lại vị trí cũ." }
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

console.log(`Added ${newExercises.length} more diverse exercises.`);
