
import fs from 'fs';

const existingPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const batch2 = [
    {
        "slug": "incline-barbell-bench-press",
        "name": "Đẩy Ngực Dốc Lên Thanh Đòn",
        "name_en": "Incline Barbell Bench Press",
        "description": "Bài tập tập trung vào phần ngực trên và cơ vai trước.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "barbell, bench",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4",
        "popularity_score": 92,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế dốc lên, chân đặt chắc chắn trên sàn. Cầm thanh đòn với lòng bàn tay hướng về phía trước." },
            { "step_number": 2, "instruction_text": "Hạ thanh đòn xuống ngực trên, giữ khuỷu tay gần cơ thể." },
            { "step_number": 3, "instruction_text": "Đẩy thanh đòn trở lại vị trí bắt đầu và thở ra." }
        ],
        "muscles": [
            { "muscle_group_id": 7, "slug_hint": "upper-chest", "impact_level": "primary" },
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "barbell-bent-over-row",
        "name": "Chèo Tạ Đòn Cúi Người",
        "name_en": "Barbell Bent Over Row",
        "description": "Bài tập xây dựng độ dày và sức mạnh cho toàn bộ vùng lưng.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "barbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4",
        "popularity_score": 95,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cúi người gập hông, giữ lưng thẳng và song song với sàn. Cầm tạ đòn bằng cả hai tay." },
            { "step_number": 2, "instruction_text": "Kéo thanh tạ về phía bụng (vùng rốn), ép xương bả vai lại với nhau." },
            { "step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí bắt đầu và lặp lại." }
        ],
        "muscles": [
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "primary" },
            { "muscle_group_id": 12, "slug_hint": "rhomboids", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "barbell-deadlift",
        "name": "Deadlift Với Tạ Đòn",
        "name_en": "Barbell Deadlift",
        "description": "Bài tập toàn thân kinh điển, tập trung vào xích sau (posterior chain).",
        "difficulty_level": "advanced",
        "exercise_type": "compound",
        "equipment_needed": "barbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4",
        "popularity_score": 100,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng hai chân rộng bằng vai, thanh tạ nằm trên giữa bàn chân." },
            { "step_number": 2, "instruction_text": "Cúi người nắm thanh tạ, giữ lưng thẳng và hông thấp xuống." },
            { "step_number": 3, "instruction_text": "Đứng thẳng dậy bằng cách đẩy sàn bằng chân, giữ thanh tạ sát vào ống chân và đùi." },
            { "step_number": 4, "instruction_text": "Hạ tạ xuống có kiểm soát bằng cách đẩy hông ra sau." }
        ],
        "muscles": [
            { "muscle_group_id": 13, "slug_hint": "erector-spinae", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" },
            { "muscle_group_id": 30, "slug_hint": "hamstrings", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "cable-pec-fly",
        "name": "Ép Ngực Với Cáp",
        "name_en": "Cable Pec Fly",
        "description": "Bài tập cô lập giúp tạo nét và cảm nhận cơ ngực tốt nhất.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pec-fly-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pec-fly-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pec-fly-front.mp4",
        "popularity_score": 88,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng giữa hai máy cáp, cầm tay nắm cáp ở độ cao ngang ngực." },
            { "step_number": 2, "instruction_text": "Bước một chân lên trước để tạo sự ổn định, hơi gập khuỷu tay." },
            { "step_number": 3, "instruction_text": "Ép hai tay lại với nhau ở trước mặt, cảm nhận sự co bóp của cơ ngực." }
        ],
        "muscles": [
            { "muscle_group_id": 8, "slug_hint": "mid-chest", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-front-raise",
        "name": "Nâng Tạ Đơn Trước Mặt",
        "name_en": "Dumbbell Front Raise",
        "description": "Bài tập cô lập tập trung vào cơ vai trước.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4",
        "popularity_score": 85,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn đặt ở trước đùi." },
            { "step_number": 2, "instruction_text": "Nâng một tay lên trước mặt cho đến khi cánh tay song song với sàn." },
            { "step_number": 3, "instruction_text": "Hạ tạ xuống và lặp lại với tay kia hoặc cả hai tay cùng lúc." }
        ],
        "muscles": [
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "primary" }
        ]
    },
    {
        "slug": "machine-leg-press",
        "name": "Đạp Đùi Với Máy",
        "name_en": "Machine Leg Press",
        "description": "Bài tập compound an toàn và hiệu quả cho đùi trước và mông.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4",
        "popularity_score": 94,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi vào máy đạp đùi, đặt hai chân lên bàn đạp rộng bằng vai." },
            { "step_number": 2, "instruction_text": "Đẩy bàn đạp ra để mở khóa an toàn, sau đó hạ bàn đạp xuống cho đến khi đầu gối gập một góc khoảng 90 độ." },
            { "step_number": 3, "instruction_text": "Đẩy bàn đạp trở lại nhưng không khóa khớp gối ở điểm cuối." }
        ],
        "muscles": [
            { "muscle_group_id": 29, "slug_hint": "quadriceps", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "machine-leg-extension",
        "name": "Đá Đùi Với Máy",
        "name_en": "Machine Leg Extension",
        "description": "Bài tập cô lập tốt nhất cho cơ đùi trước (quads).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4",
        "popularity_score": 90,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi vào máy, đặt ống chân dưới đệm chân." },
            { "step_number": 2, "instruction_text": "Dùng cơ đùi trước để nâng đệm chân lên cho đến khi chân duỗi thẳng." },
            { "step_number": 3, "instruction_text": "Hạ đệm chân xuống từ từ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 29, "slug_hint": "quadriceps", "impact_level": "primary" }
        ]
    },
    {
        "slug": "bodyweight-russian-twist",
        "name": "Vặn Người Kiểu Nga",
        "name_en": "Bodyweight Russian Twist",
        "description": "Bài tập tuyệt vời cho cơ bụng chéo và sức mạnh cơ trọng tâm.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4",
        "popularity_score": 85,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi trên sàn với đầu gối gập, ngả người ra sau một chút và nhấc chân lên khỏi sàn." },
            { "step_number": 2, "instruction_text": "Giữ hai tay chắp trước ngực, vặn thân người sang trái rồi sang phải." },
            { "step_number": 3, "instruction_text": "Giữ hông cố định và tập trung vào việc xoay phần thân trên." }
        ],
        "muscles": [
            { "muscle_group_id": 27, "slug_hint": "obliques", "impact_level": "primary" }
        ]
    },
    {
        "slug": "machine-face-pulls",
        "name": "Kéo Cáp Cho Vai Sau",
        "name_en": "Machine Face Pulls",
        "description": "Bài tập quan trọng cho sức khỏe khớp vai và cơ vai sau.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.mp4",
        "popularity_score": 82,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng trước máy cáp, sử dụng dây thừng (rope) ở độ cao ngang mặt." },
            { "step_number": 2, "instruction_text": "Kéo dây thừng về phía mặt, tách hai đầu dây sang hai bên tai." },
            { "step_number": 3, "instruction_text": "Ép mạnh cơ vai sau và cơ thang ở điểm cuối, sau đó từ từ đưa về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 17, "slug_hint": "posterior-deltoid", "impact_level": "primary" },
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "secondary" }
        ]
    }
];

// Read existing data
let musclewikiData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// Append batch 2
const combinedData = [...musclewikiData, ...batch2];

// De-duplicate by slug just in case
const uniqueData = Array.from(new Map(combinedData.map(item => [item.slug, item])).values());

// Write back to musclewiki_data.json
fs.writeFileSync(existingPath, JSON.stringify(uniqueData, null, 4));
console.log(`Updated ${existingPath} with ${uniqueData.length} exercises total.`);

// Also update mock_exercise.json
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

batch2.forEach(newItem => {
    if (!mockData.some(m => m.slug === newItem.slug)) {
        mockData.push(newItem);
    } else {
        // Update existing one in mockData if it matches slug from batch2 (sync translations)
        const idx = mockData.findIndex(m => m.slug === newItem.slug);
        mockData[idx] = newItem;
    }
});

fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));
console.log(`Updated ${mockPath} with batch 2 exercises.`);
