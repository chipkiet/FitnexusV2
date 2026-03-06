
import fs from 'fs';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const armExercises = [
    {
        "slug": "dumbbell-hammer-curl",
        "name": "Cuốn Tạ Tay Kiểu Búa (Hammer Curl)",
        "name_en": "Dumbbell Hammer Curl",
        "description": "Bài tập tuyệt vời để phát triển cơ cánh tay (brachialis) và cơ cẳng tay, giúp cánh tay trông dày hơn.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4",
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn. Lòng bàn tay hướng vào thân người (neutral grip)." },
            { "step_number": 2, "instruction_text": "Giữ cánh tay trên cố định, cuốn tạ lên trong khi vẫn giữ lòng bàn tay hướng vào nhau." },
            { "step_number": 3, "instruction_text": "Cuốn tạ cho đến khi đạt mức cao nhất và xiết chặt cơ bắp tay, sau đó từ từ hạ xuống." }
        ],
        "muscles": [
            { "muscle_group_id": 21, "slug_hint": "brachialis", "impact_level": "primary" },
            { "muscle_group_id": 22, "slug_hint": "brachioradialis", "impact_level": "primary" },
            { "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "bench-dips",
        "name": "Chống Đẩy Sau Với Ghế (Bench Dips)",
        "name_en": "Bench Dips",
        "description": "Bài tập triceps đơn giản nhưng hiệu quả, có thể thực hiện ở bất cứ đâu với một điểm tựa vững chắc.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "bench",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bench-dip-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bench-dip-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bench-dip-front.mp4",
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi cạnh ghế, đặt hai lòng bàn tay lên mép ghế. Đu đưa người ra khỏi ghế với chân duỗi thẳng phía trước." },
            { "step_number": 2, "instruction_text": "Hạ thấp cơ thể bằng cách gập khuỷu tay cho đến khi bắp tay song song với sàn." },
            { "step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ bằng sức mạnh của cơ tay sau." }
        ],
        "muscles": [
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "primary" },
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "dumbbell-kickback",
        "name": "Đá Tạ Tay Sau (Dumbbell Kickback)",
        "name_en": "Dumbbell Kickback",
        "description": "Bài tập cô lập giúp định hình và làm săn chắc cơ tam đầu (triceps).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-kickback-side.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-kickback-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-kickback-side.mp4",
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm tạ bằng một tay, cúi người về phía trước, tay kia tựa lên ghế hoặc đầu gối. Giữ cánh tay trên song song với thân người." },
            { "step_number": 2, "instruction_text": "Chỉ di chuyển cẳng tay, đá tạ ra phía sau cho đến khi cánh tay duỗi thẳng hoàn toàn." },
            { "step_number": 3, "instruction_text": "Dừng lại một chút rồi từ từ đưa tạ về vị trí cũ." }
        ],
        "muscles": [
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "primary" }
        ]
    },
    {
        "slug": "concentration-curl",
        "name": "Cuốn Tạ Tập Trung (Concentration Curl)",
        "name_en": "Concentration Curl",
        "description": "Bài tập cô lập đỉnh cao cho cơ nhị đầu, giúp tạo độ cao cho 'đỉnh' bắp tay.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-concentration-curl-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-concentration-curl-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-concentration-curl-front.mp4",
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi trên ghế, hơi cúi người. Tựa khuỷu tay của tay cầm tạ vào mặt trong của đùi cùng bên." },
            { "step_number": 2, "instruction_text": "Cuốn tạ lên phía vai mà không di chuyển khuỷu tay khỏi đùi." },
            { "step_number": 3, "instruction_text": "Siết chặt bắp tay ở điểm cao nhất rồi từ từ hạ xuống." }
        ],
        "muscles": [
            { "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "primary" }
        ]
    }
];

let mainData = JSON.parse(fs.readFileSync(musclewikiPath, 'utf8'));
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

armExercises.forEach(item => {
    if (!mainData.some(m => m.slug === item.slug)) mainData.push(item);
    if (!mockData.some(m => m.slug === item.slug)) mockData.push(item);
});

fs.writeFileSync(musclewikiPath, JSON.stringify(mainData, null, 4));
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Added ${armExercises.length} arm exercises.`);
