
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newExercises = [
    {
        "slug": "kettlebell-swing",
        "name": "Vung Tạ Ấm (Kettlebell Swing)",
        "name_en": "Kettlebell Swing",
        "description": "Bài tập toàn diện cho chuỗi cơ sau, tăng cường sức mạnh hông và tim mạch.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "kettlebell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-kettlebell-swing-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng rộng hơn vai, cầm tạ ấm bằng cả hai tay. Gập hông để tạ nằm giữa hai chân." },
            { "step_number": 2, "instruction_text": "Đẩy hông mạnh về phía trước để vung tạ lên ngang ngực." },
            { "step_number": 3, "instruction_text": "Để tạ rơi tự do và lặp lại động tác bằng cách gập hông." }
        ],
        "muscles": [
            { "muscle_group_id": 13, "slug_hint": "erector-spinae", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" },
            { "muscle_group_id": 30, "slug_hint": "hamstrings", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "dumbbell-goblet-squat",
        "name": "Squat Với Tạ Tay (Goblet Squat)",
        "name_en": "Dumbbell Goblet Squat",
        "description": "Biến thể Squat an toàn cho người mới bắt đầu, giúp giữ lưng thẳng dễ dàng hơn.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-goblet-squat-front.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm một quả tạ đơn bằng cả hai tay trước ngực." },
            { "step_number": 2, "instruction_text": "Hạ thấp hông xuống tư thế squat trong khi giữ ngực cao và lưng thẳng." },
            { "step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ." }
        ],
        "muscles": [
            { "muscle_group_id": 29, "slug_hint": "quadriceps", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" }
        ]
    },
    {
        "slug": "seated-cable-row",
        "name": "Kéo Cáp Ngồi (Seated Cable Row)",
        "name_en": "Seated Cable Row",
        "description": "Bài tập tuyệt vời để xây dựng độ dày cho lưng giữa.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-seated-cable-row-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi vào máy, đặt chân lên bục và nắm tay cầm chữ V." },
            { "step_number": 2, "instruction_text": "Kéo tay cầm về phía bụng dưới, ép chặt xương bả vai lại với nhau." },
            { "step_number": 3, "instruction_text": "Từ từ đưa tay về trí ban đầu, cảm nhận sự kéo giãn của cơ lưng." }
        ],
        "muscles": [
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "primary" },
            { "muscle_group_id": 12, "slug_hint": "rhomboids", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-pullover",
        "name": "Nằm Vớt Tạ (Dumbbell Pullover)",
        "name_en": "Dumbbell Pullover",
        "description": "Bài tập độc đáo tác động vào cả cơ ngực và cơ xô.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "dumbbell, bench",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-pullover-side.mp4",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế, giữ một quả tạ đơn bằng cả hai tay thẳng trên ngực." },
            { "step_number": 2, "instruction_text": "Hạ tạ ra sau đầu theo hình vòng cung cho đến khi cảm nhận sự kéo giãn tối đa ở cơ xô và ngực." },
            { "step_number": 3, "instruction_text": "Dùng cơ ngực và xô kéo tạ trở lại vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 8, "slug_hint": "mid-chest", "impact_level": "primary" },
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "primary" }
        ]
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
