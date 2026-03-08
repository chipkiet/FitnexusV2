
import fs from 'fs';

const existingPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newBackExercises = [
    {
        "slug": "cable-single-arm-lat-prayer",
        "name": "Kéo Cáp Một Tay Tập Xô (Lat Prayer)",
        "name_en": "Cable Single Arm Lat Prayer",
        "description": "Bài tập tuyệt vời để cô lập và kéo giãn tối đa cơ xô, giúp phát triển độ rộng của lưng.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-single-arm-lat-prayer-side.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-single-arm-lat-prayer-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-single-arm-lat-prayer-side.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/cable-single-arm-lat-prayer",
        "instructions": [
            { "step_number": 1, "instruction_text": "Sử dụng tay cầm đơn, đặt cáp ở vị trí cao nhất của máy." },
            { "step_number": 2, "instruction_text": "Cầm tay cầm và bước lùi lại. Đẩy hông ra sau, người hơi nghiêng về phía trước sao cho tai ngang với cánh tay." },
            { "step_number": 3, "instruction_text": "Cố định khuỷu tay, dùng cơ xô kéo cáp xuống đồng thời đẩy hông về phía trước cho đến khi tay chạm hông." }
        ],
        "muscles": [
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "primary" }
        ]
    },
    {
        "slug": "cable-pull-through",
        "name": "Kéo Cáp Qua Chân (Pull Through)",
        "name_en": "Cable Pull Through",
        "description": "Bài tập phát triển sức mạnh xích sau, tập trung vào lưng dưới, mông và đùi sau.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-pull-through-side.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-pull-through-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-pull-through-side.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/cable-pull-through",
        "instructions": [
            { "step_number": 1, "instruction_text": "Sử dụng dây thừng (rope), đặt cáp ở vị trí thấp nhất." },
            { "step_number": 2, "instruction_text": "Đứng quay lưng lại máy, hai chân bước qua dây cáp, hai tay cầm đầu dây. Bước ra xa vài bước." },
            { "step_number": 3, "instruction_text": "Gập người tại hông, giữ lưng thẳng và đầu gối hơi gập nhẹ." },
            { "step_number": 4, "instruction_text": "Đẩy hông mạnh về phía trước để trở lại tư thế đứng thẳng." }
        ],
        "muscles": [
            { "muscle_group_id": 13, "slug_hint": "erector-spinae", "impact_level": "primary" },
            { "muscle_group_id": 31, "slug_hint": "gluteus-maximus", "impact_level": "primary" },
            { "muscle_group_id": 30, "slug_hint": "hamstrings", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "pull-ups",
        "name": "Hít Xà Đơn (Pull Ups)",
        "name_en": "Pull Ups",
        "description": "Bài tập trọng lượng cơ thể tốt nhất để phát triển độ rộng của lưng và sức mạnh thân trên.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/pull-ups",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nắm thanh xà bằng tay úp (overhand grip), độ rộng hơn vai một chút." },
            { "step_number": 2, "instruction_text": "Kéo người lên cho đến khi cằm vượt qua thanh xà, tập trung vào việc ép xương bả vai." },
            { "step_number": 3, "instruction_text": "Từ từ hạ người xuống vị trí bắt đầu, duỗi thẳng tay hoàn toàn." }
        ],
        "muscles": [
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "primary" },
            { "muscle_group_id": 20, "slug_hint": "biceps-brachii", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "inverted-row",
        "name": "Hít Xà Ngược (Inverted Row)",
        "name_en": "Inverted Row",
        "description": "Bài tập tuyệt vời để xây dựng độ dày cho lưng giữa và cải thiện sự ổn định của xương bả vai.",
        "difficulty_level": "beginner",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-reverse-row-side.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-reverse-row-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-reverse-row-side.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/inverted-row",
        "instructions": [
            { "step_number": 1, "instruction_text": "Nằm dưới một thanh xà ngang cố định, nắm thanh xà bằng tay úp với độ rộng hơn vai." },
            { "step_number": 2, "instruction_text": "Giữ cơ thể thẳng từ đầu đến gót chân, thực hiện kéo ngực sát về phía thanh xà." },
            { "step_number": 3, "instruction_text": "Từ từ hạ người xuống cho đến khi cánh tay duỗi thẳng hoàn toàn." }
        ],
        "muscles": [
            { "muscle_group_id": 12, "slug_hint": "rhomboids", "impact_level": "primary" },
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "primary" },
            { "muscle_group_id": 10, "slug_hint": "latissimus-dorsi", "impact_level": "secondary" }
        ]
    }
];

// Update musclewiki_data.json
let musclewikiData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
newBackExercises.forEach(newItem => {
    if (!musclewikiData.some(m => m.slug === newItem.slug)) {
        musclewikiData.push(newItem);
    }
});
fs.writeFileSync(existingPath, JSON.stringify(musclewikiData, null, 4));

// Update mock_exercise.json
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
newBackExercises.forEach(newItem => {
    if (!mockData.some(m => m.slug === newItem.slug)) {
        mockData.push(newItem);
    }
});
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Added ${newBackExercises.length} back exercises to both files.`);
