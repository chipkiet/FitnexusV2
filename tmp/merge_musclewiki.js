
import fs from 'fs';

const existingPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newData = [
    {
        "slug": "barbell-curl",
        "name": "Cuốn Tạ Đòn",
        "name_en": "Barbell Curl",
        "description": "Bài tập cơ bản tốt nhất để phát triển cơ nhị đầu (biceps).",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "barbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4",
        "popularity_score": 95,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn với lòng bàn tay hướng về phía trước." },
            { "step_number": 2, "instruction_text": "Giữ cánh tay trên cố định, cuốn tạ lên trong khi co bóp cơ nhị đầu." },
            { "step_number": 3, "instruction_text": "Tiếp tục nâng tạ cho đến khi cơ nhị đầu co hết mức và thanh tạ ở ngang vai." },
            { "step_number": 4, "instruction_text": "Từ từ hạ thanh tạ về vị trí bắt đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-curl",
        "name": "Cuốn Tạ Đơn",
        "name_en": "Dumbbell Curl",
        "description": "Bài tập linh hoạt cho cơ nhị đầu, giúp cân bằng sức mạnh hai tay.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4",
        "popularity_score": 90,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn." },
            { "step_number": 2, "instruction_text": "Cuốn một quả tạ lên và xoay cẳng tay cho đến khi lòng bàn tay hướng về phía vai." },
            { "step_number": 3, "instruction_text": "Hạ tạ về vị trí ban đầu và lặp lại với tay kia." }
        ],
        "muscles": [
            { "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-seated-overhead-tricep-extension",
        "name": "Đẩy Tạ Đơn Sau Đầu",
        "name_en": "Dumbbell Seated Overhead Tricep Extension",
        "description": "Bài tập hiệu quả để kéo giãn và phát triển đầu dài của cơ tam đầu (triceps).",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell, bench",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
        "popularity_score": 88,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi trên ghế và giữ một quả tạ bằng cả hai tay. Giơ tạ lên cao qua đầu." },
            { "step_number": 2, "instruction_text": "Giữ khuỷu tay sát đầu, hạ tạ xuống phía sau đầu." },
            { "step_number": 3, "instruction_text": "Đẩy tạ trở lại vị trí bắt đầu bằng cách duỗi thẳng tay." }
        ],
        "muscles": [
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "primary" }
        ]
    },
    {
        "slug": "cable-v-bar-push-down",
        "name": "Đẩy Cáp Tay Sau V-Bar",
        "name_en": "Machine Cable V Bar Push Downs",
        "description": "Bài tập cô lập cơ tam đầu với máy cáp.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-push-downs-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-push-downs-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-push-downs-front.mp4",
        "popularity_score": 92,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nắm thanh V-bar với lòng bàn tay hướng xuống." },
            { "step_number": 2, "instruction_text": "Đứng thẳng, hơi nghiêng người về phía trước. Đẩy thanh cáp xuống cho đến khi cánh tay duỗi thẳng hoàn toàn." },
            { "step_number": 3, "instruction_text": "Dừng lại một chút rồi từ từ đưa thanh cáp trở lại vị trí bắt đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "primary" }
        ]
    },
    {
        "slug": "crunches",
        "name": "Gập Bụng",
        "name_en": "Crunches",
        "description": "Bài tập cơ bản để tác động vào cơ thẳng bụng.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "body-weight",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4",
        "popularity_score": 95,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm ngửa trên sàn, đầu gối gập và bàn chân đặt phẳng trên sàn." },
            { "step_number": 2, "instruction_text": "Đặt nhẹ tay sau gáy hoặc thái dương." },
            { "step_number": 3, "instruction_text": "Gồng cơ bụng và nâng đầu, vai lên khỏi sàn. Sau đó hạ xuống và lặp lại." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }
        ]
    },
    {
        "slug": "medicine-ball-plank",
        "name": "Plank Với Bóng",
        "name_en": "Medicine Ball Plank",
        "description": "Bài tập ổn định cơ trọng tâm (core) nâng cao với bóng tập.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "medicine-ball",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-medicine-ball-plank-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-medicine-ball-plank-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-medicine-ball-plank-front.mp4",
        "popularity_score": 85,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đặt bóng tập trên sàn." },
            { "step_number": 2, "instruction_text": "Đặt hai tay lên bóng và duỗi chân ra sau tư thế chống đẩy." },
            { "step_number": 3, "instruction_text": "Giữ lưng thẳng và gồng cơ bụng. Giữ tư thế trong thời gian yêu cầu." }
        ],
        "muscles": [
            { "muscle_group_id": 26, "slug_hint": "rectus-abdominis", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-wrist-curl",
        "name": "Cuốn Cổ Tay Tạ Đơn",
        "name_en": "Dumbbell Wrist Curl",
        "description": "Bài tập phát triển cơ cẳng tay và sức mạnh nắm tay.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4",
        "popularity_score": 80,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm tạ đơn với lòng bàn tay hướng lên, tựa cẳng tay lên ghế hoặc đùi." },
            { "step_number": 2, "instruction_text": "Từ từ cuốn cổ tay lên trên." },
            { "step_number": 3, "instruction_text": "Hạ tạ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 24, "slug_hint": "wrist-flexors", "impact_level": "primary" }
        ]
    },
    {
        "slug": "barbell-wrist-curl",
        "name": "Cuốn Cổ Tay Tạ Đòn",
        "name_en": "Barbell Wrist Curl",
        "description": "Bài tập tăng kích thước và sức bền cho cẳng tay.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "barbell",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-wrist-curl-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-wrist-curl-side.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-wrist-curl-side.mp4",
        "popularity_score": 82,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nắm thanh tạ đòn với lòng bàn tay hướng lên." },
            { "step_number": 2, "instruction_text": "Quỳ cạnh ghế, đặt cẳng tay lên ghế sao cho cổ tay ở ngoài mép ghế." },
            { "step_number": 3, "instruction_text": "Để thanh tạ kéo cổ tay xuống, sau đó cuốn ngược lên trên." }
        ],
        "muscles": [
            { "muscle_group_id": 24, "slug_hint": "wrist-flexors", "impact_level": "primary" }
        ]
    },
    {
        "slug": "seated-calf-raise",
        "name": "Nhón Bắp Chân Ngồi",
        "name_en": "Seated Calf Raise",
        "description": "Bài tập tập trung vào cơ dép (soleus) của bắp chân.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Vitruvian-seated-calf-raise-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Vitruvian-seated-calf-raise-side.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Vitruvian-seated-calf-raise-side.mp4",
        "popularity_score": 85,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Ngồi vào máy và đặt đệm lên trên đùi." },
            { "step_number": 2, "instruction_text": "Nhón gót chân lên cao hết mức có thể." },
            { "step_number": 3, "instruction_text": "Hạ gót chân xuống dưới mức song song và lặp lại." }
        ],
        "muscles": [
            { "muscle_group_id": 37, "slug_hint": "soleus", "impact_level": "primary" }
        ]
    },
    {
        "slug": "smith-machine-calf-raise",
        "name": "Nhón Bắp Chân Với Máy Smith",
        "name_en": "Smith Machine Calf Raise",
        "description": "Bài tập ổn định để phát triển cơ bắp chân lớn (gastrocnemius).",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Smithmachine-calf-raise-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Smithmachine-calf-raise-front.mp4",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Smithmachine-calf-raise-front.mp4",
        "popularity_score": 87,
        "is_public": true,
        "source_name": "MuscleWiki",
        "instructions": [
            { "step_number": 1, "instruction_text": "Đặt thanh tạ của máy Smith lên phần lưng trên." },
            { "step_number": 2, "instruction_text": "Đứng thẳng với bàn chân phẳng." },
            { "step_number": 3, "instruction_text": "Nhón gót chân lên cao trong khi giữ đầu gối cố định." },
            { "step_number": 4, "instruction_text": "Từ từ hạ gót chân về vị trí cũ." }
        ],
        "muscles": [
            { "muscle_group_id": 36, "slug_hint": "gastrocnemius", "impact_level": "primary" }
        ]
    }
];

// Read existing data
let musclewikiData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// Translate existing ones and ensure Vietnamese
musclewikiData.forEach(ex => {
    if (ex.slug === 'barbell-bench-press') {
        ex.instructions = [
            { "step_number": 1, "instruction_text": "Nằm ngửa trên ghế phẳng, chân đặt trên sàn. Nhấc thanh tạ ra khỏi giá tạ." },
            { "step_number": 2, "instruction_text": "Hạ thanh tạ xuống giữa ngực." },
            { "step_number": 3, "instruction_text": "Đẩy thanh tạ lên cho đến khi khóa khuỷu tay." }
        ];
    } else if (ex.slug === 'dumbbell-bench-press') {
        ex.instructions = [
            { "step_number": 1, "instruction_text": "Bắt đầu bằng cách nằm ngửa trên ghế phẳng, mỗi tay cầm một quả tạ đơn." },
            { "step_number": 2, "instruction_text": "Giữ tạ ở ngang ngực với lòng bàn tay hướng về phía trước." },
            { "step_number": 3, "instruction_text": "Gồng cơ bụng và đẩy tạ lên cao cho đến khi cánh tay duỗi thẳng hoàn toàn." }
        ];
    } else if (ex.slug === 'push-up') {
        ex.instructions = [
            { "step_number": 1, "instruction_text": "Đặt hai tay chắc chắn trên sàn, ngay dưới vai." },
            { "step_number": 2, "instruction_text": "Giữ lưng thẳng sao cho toàn bộ cơ thể tạo thành một đường thẳng và từ từ hạ thấp người xuống." },
            { "step_number": 3, "instruction_text": "Kéo xương bả vai ra sau và xuống dưới, giữ khuỷu tay áp sát vào cơ thể." },
            { "step_number": 4, "instruction_text": "Thở ra khi đẩy người trở lại vị trí ban đầu." }
        ];
    }
});

// Append new data
const combinedData = [...musclewikiData, ...newData];

// Write back to musclewiki_data.json
fs.writeFileSync(existingPath, JSON.stringify(combinedData, null, 4));
console.log(`Updated ${existingPath} with ${combinedData.length} exercises.`);

// Also update mock_exercise.json
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

// Only add if not exists in mockData
newData.forEach(newItem => {
    if (!mockData.some(m => m.slug === newItem.slug)) {
        mockData.push(newItem);
    }
});

// Also sync translations for existing ones in mockData
mockData.forEach(ex => {
    const original = musclewikiData.find(o => o.slug === ex.slug);
    if (original) {
        ex.instructions = original.instructions;
    }
});

fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));
console.log(`Updated ${mockPath} with new exercises and translations.`);
