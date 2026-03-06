
import fs from 'fs';
import path from 'path';

const musclewikiPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const legsPath = 'c:/FEFV2/FitnexusV2/data/exercise/legs_data.json';
const backShouldersPath = 'c:/FEFV2/FitnexusV2/data/exercise/back_shoulders_data.json';

// New Chest Exercises to be added
const additionalChest = [
    {
        "slug": "dumbbell-incline-bench-press",
        "name": "Đẩy Ngực Dốc Lên Với Tạ Tay",
        "name_en": "Dumbbell Incline Bench Press",
        "description": "Bài tập tuyệt vời để phát triển phần ngực trên, giúp ngực trông đầy đặn hơn.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "dumbbell, bench",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/dumbbell-incline-bench-press",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế dốc lên khoảng 30 độ, mỗi tay cầm một quả tạ đơn." },
            { "step_number": 2, "instruction_text": "Hạ tạ xuống ngang ngực trên, giữ khuỷu tay ở góc khoảng 45 độ so với cơ thể." },
            { "step_number": 3, "instruction_text": "Đẩy tạ lên cao theo đường vòng cung cho đến khi hai tạ gần chạm nhau ở phía trên ngực." }
        ],
        "muscles": [
            { "muscle_group_id": 7, "slug_hint": "upper-chest", "impact_level": "primary" },
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "machine-pec-fly",
        "name": "Ép Ngực Với Máy (Pec Deck)",
        "name_en": "Machine Pec Fly",
        "description": "Bài tập cô lập giúp tạo nét và cảm nhận cơ ngực giữa cực tốt, giảm thiểu sự tham gia của tay sau.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pec-fly-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pec-fly-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pec-fly-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/machine-pec-fly",
        "instructions": [
            { "step_number": 1, "instruction_text": "Điều chỉnh ghế sao cho tay cầm ngang với ngực. Ngồi tựa sát lưng vào đệm." },
            { "step_number": 2, "instruction_text": "Dùng cơ ngực ép hai tay cầm lại với nhau ở phía trước mặt. Giữ khuỷu tay hơi gập nhẹ." },
            { "step_number": 3, "instruction_text": "Từ từ đưa tay về vị trí cũ sao cho cảm thấy cơ ngực được kéo giãn căng." }
        ],
        "muscles": [
            { "muscle_group_id": 8, "slug_hint": "mid-chest", "impact_level": "primary" }
        ]
    },
    {
        "slug": "dumbbell-fly",
        "name": "Nằm Dang Tạ Tay Tập Ngực",
        "name_en": "Dumbbell Fly",
        "description": "Bài tập kéo giãn cơ ngực, giúp mở rộng lồng ngực và tạo độ sâu cho rãnh ngực.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell, bench",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-fly-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-fly-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-fly-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/dumbbell-flys",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm trên ghế phẳng, cầm hai quả tạ hướng lên trên ngực." },
            { "step_number": 2, "instruction_test": "Từ từ hạ tạ sang hai bên theo hình vòng cung cho đến khi cảm thấy ngực căng." },
            { "step_number": 3, "instruction_text": "Dùng cơ ngực kéo tạ trở lại vị trí ban đầu như đang ôm một vòng tay lớn." }
        ],
        "muscles": [
            { "muscle_group_id": 8, "slug_hint": "mid-chest", "impact_level": "primary" }
        ]
    },
    {
        "slug": "chest-dips",
        "name": "Xà Kép Tập Ngực (Chest Dips)",
        "name_en": "Chest Dips",
        "description": "Bài tập bodyweight mạnh mẽ tập trung vào phần ngực dưới và cơ vai.",
        "difficulty_level": "advanced",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chest-dip-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chest-dip-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chest-dip-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/chest-dips",
        "instructions": [
            { "step_number": 1, "instruction_text": "Chống tay lên xà kép, hơi nghiêng người về phía trước để tập trung vào cơ ngực." },
            { "step_number": 2, "instruction_text": "Hạ thấp người xuống cho đến khi cánh tay gập một góc khoảng 90 độ." },
            { "step_number": 3, "instruction_text": "Đẩy mạnh tay để nâng người trở lại vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 9, "slug_hint": "lower-chest", "impact_level": "primary" },
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "secondary" },
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "secondary" }
        ]
    }
];

// Load existing data
let mainData = JSON.parse(fs.readFileSync(musclewikiPath, 'utf8'));
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));

// Load batch data
let legsData = fs.existsSync(legsPath) ? JSON.parse(fs.readFileSync(legsPath, 'utf8')) : [];
let backShouldersData = fs.existsSync(backShouldersPath) ? JSON.parse(fs.readFileSync(backShouldersPath, 'utf8')) : [];

const allNew = [...legsData, ...backShouldersData, ...additionalChest];

let addedCount = 0;
allNew.forEach(item => {
    const mainIdx = mainData.findIndex(m => m.slug === item.slug);
    if (mainIdx === -1) {
        mainData.push(item);
        addedCount++;
    } else {
        // Option to update existing if desired, but for now we skip duplicates
    }

    const mockIdx = mockData.findIndex(m => m.slug === item.slug);
    if (mockIdx === -1) {
        mockData.push(item);
    }
});

fs.writeFileSync(musclewikiPath, JSON.stringify(mainData, null, 4));
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Merged ${allNew.length} exercises. Newly added to main: ${addedCount}.`);
