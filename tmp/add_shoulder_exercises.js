
import fs from 'fs';

const existingPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';

const newShoulderExercises = [
    {
        "slug": "dumbbell-seated-overhead-press",
        "name": "Đẩy Tạ Đơn Qua Đầu Khi Ngồi",
        "name_en": "Dumbbell Seated Overhead Press",
        "description": "Bài tập phát triển toàn diện cơ vai, đặc biệt là vai trước và vai giữa.",
        "difficulty_level": "intermediate",
        "exercise_type": "compound",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/dumbbell-seated-overhead-press",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm hai quả tạ đơn và ngồi trên ghế có tựa lưng. Đảm bảo lưng tựa sát vào phần đệm." },
            { "step_number": 2, "instruction_text": "Mở rộng khuỷu tay sang hai bên, lòng bàn tay hướng về phía trước." },
            { "step_number": 3, "instruction_text": "Đẩy tạ lên trên cho đến khi cánh tay duỗi thẳng hoàn toàn (không khóa khớp khuỷu tay)." },
            { "step_number": 4, "instruction_text": "Từ từ hạ tạ xuống cho đến khi bắp tay song song với sàn hoặc tạ chạm nhẹ vào vai." }
        ],
        "muscles": [
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "primary" },
            { "muscle_group_id": 16, "slug_hint": "lateral-deltoid", "impact_level": "primary" },
            { "muscle_group_id": 23, "slug_hint": "triceps-brachii", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "cable-low-single-arm-lateral-raise",
        "name": "Dang Một Tay Với Cáp Thấp",
        "name_en": "Cable Low Single Arm Lateral Raise",
        "description": "Bài tập cô lập giúp tạo nét và phát triển cơ vai giữa.",
        "difficulty_level": "beginner",
        "exercise_type": "isolation",
        "equipment_needed": "machine",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/cable-low-single-arm-lateral-raise",
        "instructions": [
            { "step_number": 1, "instruction_text": "Sử dụng tay cầm đơn với mức cáp được thiết lập ở vị trí thấp nhất của máy." },
            { "step_number": 2, "instruction_text": "Đứng nghiêng người so với máy, nâng cánh tay thẳng ra phía bên ngoài." },
            { "step_number": 3, "instruction_text": "Nâng cho đến khi cánh tay song song với sàn nhà rồi từ từ hạ về vị trí bắt đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 16, "slug_hint": "lateral-deltoid", "impact_level": "primary" }
        ]
    },
    {
        "slug": "elevated-pike-press",
        "name": "Hít Đất Pike Chân Trên Cao",
        "name_en": "Elevated Pike Press",
        "description": "Bài tập trọng lượng cơ thể nâng cao giúp tăng sức mạnh và độ linh hoạt cho khớp vai.",
        "difficulty_level": "advanced",
        "exercise_type": "compound",
        "equipment_needed": "body-weight",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/elevated-pike-press",
        "instructions": [
            { "step_number": 1, "instruction_text": "Sử dụng một chiếc ghế hoặc vật dụng để nâng cao chân của bạn." },
            { "step_number": 2, "instruction_text": "Hạ đầu về phía sàn bằng cách gập khuỷu tay, giữ hông cao tạo thành hình chữ V ngược." },
            { "step_number": 3, "instruction_text": "Đẩy mạnh đôi bàn tay để nâng người trở lại vị trí ban đầu." },
            { "step_number": 4, "instruction_text": "Lặp lại động tác." }
        ],
        "muscles": [
            { "muscle_group_id": 15, "slug_hint": "anterior-deltoid", "impact_level": "primary" },
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "secondary" }
        ]
    },
    {
        "slug": "dumbbell-seated-rear-delt-fly",
        "name": "Ép Tạ Đơn Vai Sau Khi Ngồi",
        "name_en": "Dumbbell Seated Rear Delt Fly",
        "description": "Bài tập cô lập hiệu quả nhất để phát triển nhóm cơ vai sau và cải thiện tư thế.",
        "difficulty_level": "intermediate",
        "exercise_type": "isolation",
        "equipment_needed": "dumbbell",
        "video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-rear-delt-fly-side.mp4",
        "primary_video_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-rear-delt-fly-side.mp4",
        "thumbnail_url": "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-rear-delt-fly-side.mp4",
        "source_name": "MuscleWiki",
        "source_url": "https://musclewiki.com/exercise/dumbbell-seated-rear-delt-fly",
        "instructions": [
            { "step_number": 1, "instruction_text": "Cầm tạ trong mỗi tay, ngồi trên ghế và cúi người về phía trước, ngực gần chạm đùi. Tạ để dưới đùi." },
            { "step_number": 2, "instruction_text": "Giữ khuỷu tay hơi cong, nâng cánh tay sang hai bên cho đến khi ngang vai." },
            { "step_number": 3, "instruction_text": "Dừng lại một chút ở điểm cao nhất để cảm nhận cơ vai sau co bóp." },
            { "step_number": 4, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu." }
        ],
        "muscles": [
            { "muscle_group_id": 17, "slug_hint": "posterior-deltoid", "impact_level": "primary" },
            { "muscle_group_id": 11, "slug_hint": "trapezius", "impact_level": "secondary" }
        ]
    }
];

// Update musclewiki_data.json
let musclewikiData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
newShoulderExercises.forEach(newItem => {
    if (!musclewikiData.some(m => m.slug === newItem.slug)) {
        musclewikiData.push(newItem);
    }
});
fs.writeFileSync(existingPath, JSON.stringify(musclewikiData, null, 4));

// Update mock_exercise.json
let mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
newShoulderExercises.forEach(newItem => {
    if (!mockData.some(m => m.slug === newItem.slug)) {
        mockData.push(newItem);
    }
});
fs.writeFileSync(mockPath, JSON.stringify(mockData, null, 2));

console.log(`Added ${newShoulderExercises.length} shoulder exercises to both files.`);
