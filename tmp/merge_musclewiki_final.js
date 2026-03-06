
import fs from 'fs';

const existingPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const finalBatch = [
    {
        "slug": "barbell-shrugs",
        "name": "Nhún Cầu Vai Thanh Đòn",
        "name_en": "Barbell Shrugs",
        "description": "Bài tập phát triển sức mạnh và kích thước cho nhóm cơ cầu vai (traps).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "barbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-shrugs-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-shrugs-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-shrugs-front.mp4",
        "popularity_score": 88,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn ở ngang đùi với lòng bàn tay hướng về phía cơ thể." },
            { "step_number": 2, "instruction_text": "Nhún vai lên cao hết mức có thể về phía tai mặt (không xoay vai)." },
            { "step_number": 3, "instruction_text": "Dừng lại một chút ở điểm cao nhất rồi từ từ hạ xuống." }
        ],
        "muscles": [
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "primary" }
        ]
    },
    {
        "slug": "machine-lying-leg-curl",
        "name": "Cuốn Chân Nằm Với Máy",
        "name_en": "Machine Lying Leg Curl",
        "description": "Bài tập cô lập chính cho nhóm cơ đùi sau (hamstrings).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-lying-leg-curl-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-lying-leg-curl-side.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-lying-leg-curl-side.mp4",
        "popularity_score": 90,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm sấp trên máy cuốn chân, đặt gót chân dưới đệm chân." },
            { "step_number": 2, "instruction_text": "Cuốn chân lên phía mông bằng cách sử dụng cơ đùi sau." },
            { "step_number": 3, "instruction_text": "Hạ chân xuống từ từ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 30, "slug_hint": "hamstrings", "impact_level": "primary" }
        ]
    },
    {
        "slug": "barbell-decline-bench-press",
        "name": "Đẩy Ngực Dốc Xuống Thanh Đòn",
        "name_en": "Barbell Decline Bench Press",
        "description": "Bài tập tập trung vào phần ngực dưới và cơ tam đầu.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "barbell, bench",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-decline-bench-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-decline-bench-press-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-decline-bench-press-front.mp4",
        "popularity_score": 85,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế dốc xuống, móc chân vào giá đỡ của ghế. Nhấc thanh tạ ra khỏi giá." },
            { "step_number": 2, "instruction_text": "Hạ thanh tạ xuống phần ngực dưới của bạn." },
            { "step_number": 3, "instruction_text": "Đẩy thanh tạ lên cho đến khi tay duỗi thẳng hoàn toàn." }
        ],
        "muscles": [
            { "muscle_group_id": 9, "slug_hint": "lower-chest", "impact_level": "primary" },
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "bodyweight-walking-lunges",
        "name": "Lunge Bước Đi",
        "name_en": "Bodyweight Walking Lunges",
        "description": "Bài tập phát triển sức mạnh đùi, mông và khả năng thăng bằng.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-walking-lunge-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-walking-lunge-side.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-walking-lunge-side.mp4",
        "popularity_score": 88,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng với hai chân chụm lại." },
            { "step_number": 2, "instruction_text": "Bước một chân lên xa phía trước, hạ thấp hông cho đến khi cả hai đầu gối gập một góc khoảng 90 độ." },
            { "step_number": 3, "instruction_text": "Đứng dậy và bước chân sau lên phía trước và lặp lại động tác lunge với chân kia." }
        ],
        "muscles": [
            { "muscle_group_id": 29, "slug_hint": "quadriceps", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" }
        ]
    },
    {
        "slug": "bodyweight-hanging-leg-raise",
        "name": "Treo Người Nhấc Chân",
        "name_en": "Bodyweight Hanging Leg Raise",
        "description": "Bài tập nâng cao cho cơ bụng dưới và cơ gấp hông.",
        "difficulty_level": "advanced",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-leg-raise-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-leg-raise-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-leg-raise-front.mp4",
        "popularity_score": 90,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Treo người trên thanh xà đơn, giữ thẳng tay." },
            { "step_number": 2, "instruction_text": "Nâng hai chân lên (có thể duỗi thẳng hoặc gập gối) cho đến khi hông gập hoàn toàn." },
            { "step_number": 3, "instruction_text": "Hạ chân xuống từ từ, cố gắng không để cơ thể bị đung đưa." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }
        ]
    }
];

// Read existing data
let musclewikiData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// Append final batch
const combinedData = [...musclewikiData, ...finalBatch];

// De-duplicate by slug
const uniqueData = Array.from(new Map(combinedData.map(item => [item.slug, item])).values());

// Write back to musclewiki_data.json
fs.writeFileSync(existingPath, JSON.stringify(uniqueData, null, 4));
console.log(`Updated ${existingPath} with all batches. Total: ${uniqueData.length} exercises.`);

// Also update mock_exercise.json
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

finalBatch.forEach(newItem => {
    if (!mockData.some(m => m.slug === newItem.slug)) {
        mockData.push(newItem);
    } else {
        const idx = mockData.findIndex(m => m.slug === newItem.slug);
        mockData[idx] = newItem;
    }
});

fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));
console.log(`Updated ${mockPath} with final batch exercises.`);
