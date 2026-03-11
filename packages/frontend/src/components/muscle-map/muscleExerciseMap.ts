// muscleExerciseMap.ts
// Maps each muscle key (matching muscleInfoMap keys) to a list of exercises
// with their real database IDs.

export interface MuscleExercise {
    id: number;
    name: string;
}

export const muscleExerciseMap: Record<string, MuscleExercise[]> = {

    // ── Front view ────────────────────────────────────────────────────────────

    chest: [
        { id: 1,   name: "Đẩy Ngực Ngang Thanh Đòn" },
        { id: 2,   name: "Đẩy Ngực Ngang Tạ Tay" },
        { id: 94,  name: "Đẩy Ngực Dốc Lên Thanh Đòn" },
        { id: 134, name: "Đẩy Ngực Dốc Xuống Thanh Đòn" },
        { id: 97,  name: "Ép Ngực Với Cáp" },
        { id: 178, name: "Đẩy Ngực Dốc Lên Với Tạ Tay" },
        { id: 179, name: "Ép Ngực Với Máy (Pec Deck)" },
        { id: 180, name: "Nằm Dang Tạ Tay Tập Ngực" },
        { id: 181, name: "Xà Kép Tập Ngực (Chest Dips)" },
        { id: 3,   name: "Hít Đất" },
        { id: 173, name: "Hít Đất Pike Chân Trên Cao" },
        { id: 416, name: "Hít Đất Chân Cao (Decline Push-up)" },
        { id: 202, name: "Nằm Vớt Tạ (Dumbbell Pullover)" },
    ],

    abs: [
        { id: 68,  name: "Gập Bụng" },
        { id: 186, name: "Nằm Nhấc Chân (Leg Raises)" },
        { id: 187, name: "Plank Cẳng Tay (Forearm Plank)" },
        { id: 69,  name: "Plank Với Bóng" },
        { id: 193, name: "Treo Người Co Gối (Hanging Knee Raises)" },
        { id: 194, name: "Leo Núi Tại Chỗ (Mountain Climber)" },
        { id: 195, name: "Giữ Thân Hình Chuối (Hollow Hold)" },
        { id: 101, name: "Vặn Người Kiểu Nga" },
        { id: 413, name: "Gập Bụng Đạp Xe (Bicycle Crunches)" },
        { id: 136, name: "Treo Người Nhấc Chân" },
        { id: 414, name: "Kéo Cáp Chặt Gỗ (Cable Woodchop)" },
        { id: 269, name: "Burpees (Nhảy Hít Đất)" },
    ],

    shoulders: [
        { id: 42,  name: "Đẩy Tạ Đòn Qua Đầu" },
        { id: 43,  name: "Dang Tạ Tay Sang Bên" },
        { id: 98,  name: "Nâng Tạ Đơn Trước Mặt" },
        { id: 132, name: "Nhún Cầu Vai Thanh Đòn" },
        { id: 171, name: "Đẩy Tạ Đơn Qua Đầu Khi Ngồi" },
        { id: 189, name: "Nhún Cầu Vai Với Tạ Tay" },
        { id: 190, name: "Kéo Tạ Đòn Thẳng Đứng (Upright Row)" },
        { id: 172, name: "Dang Một Tay Với Cáp Thấp" },
        { id: 102, name: "Kéo Cáp Cho Vai Sau" },
    ],

    biceps: [
        { id: 64,  name: "Cuốn Tạ Đòn" },
        { id: 65,  name: "Cuốn Tạ Đơn" },
        { id: 182, name: "Cuốn Tạ Tay Kiểu Búa (Hammer Curl)" },
        { id: 185, name: "Cuốn Tạ Tập Trung (Concentration Curl)" },
        { id: 197, name: "Cuốn Tay Trước Với Cáp" },
        { id: 40,  name: "Hít Xà Đơn" },
        { id: 177, name: "Hít Xà Ngược (Inverted Row)" },
    ],

    forearms: [
        { id: 70,  name: "Cuốn Cổ Tay Tạ Đơn" },
        { id: 71,  name: "Cuốn Cổ Tay Tạ Đòn" },
        { id: 191, name: "Cuốn Cổ Tay Tạ Đòn Sau Lưng" },
    ],

    quads: [
        { id: 16,  name: "Squat Với Tạ Đòn" },
        { id: 200, name: "Squat Với Tạ Tay (Goblet Squat)" },
        { id: 135, name: "Lunge Bước Đi" },
        { id: 100, name: "Đá Đùi Với Máy" },
        { id: 99,  name: "Đạp Đùi Với Máy" },
        { id: 199, name: "Vung Tạ Ấm (Kettlebell Swing)" },
    ],

    calves: [
        { id: 72,  name: "Nhón Bắp Chân Ngồi" },
        { id: 73,  name: "Nhón Bắp Chân Với Máy Smith" },
        { id: 188, name: "Nhón Bắp Chân Đứng Với Máy" },
        { id: 196, name: "Nhón Bắp Chân Với Tạ Ấm" },
    ],

    traps: [
        { id: 132, name: "Nhún Cầu Vai Thanh Đòn" },
        { id: 189, name: "Nhún Cầu Vai Với Tạ Tay" },
        { id: 190, name: "Kéo Tạ Đòn Thẳng Đứng (Upright Row)" },
        { id: 95,  name: "Chèo Tạ Đòn Cúi Người" },
    ],

    // ── Back view ─────────────────────────────────────────────────────────────

    trapezius: [
        { id: 132, name: "Nhún Cầu Vai Thanh Đòn" },
        { id: 189, name: "Nhún Cầu Vai Với Tạ Tay" },
        { id: 190, name: "Kéo Tạ Đòn Thẳng Đứng (Upright Row)" },
        { id: 95,  name: "Chèo Tạ Đòn Cúi Người" },
    ],

    rear_deltoids: [
        { id: 102, name: "Kéo Cáp Cho Vai Sau" },
        { id: 415, name: "Dang Tạ Tay Ngược (Reverse Fly)" },
        { id: 174, name: "Ép Tạ Đơn Vai Sau Khi Ngồi" },
    ],

    triceps: [
        { id: 66,  name: "Đẩy Tạ Đơn Sau Đầu" },
        { id: 67,  name: "Đẩy Cáp Tay Sau V-Bar" },
        { id: 184, name: "Đá Tạ Tay Sau (Dumbbell Kickback)" },
        { id: 183, name: "Chống Đẩy Sau Với Ghế (Bench Dips)" },
        { id: 198, name: "Chống Xà Kép Tập Tay Sau" },
    ],

    lats: [
        { id: 40,  name: "Hít Xà Đơn" },
        { id: 41,  name: "Kéo Xô Máy" },
        { id: 201, name: "Kéo Cáp Ngồi (Seated Cable Row)" },
        { id: 95,  name: "Chèo Tạ Đòn Cúi Người" },
        { id: 175, name: "Kéo Cáp Một Tay Tập Xô (Lat Prayer)" },
        { id: 177, name: "Hít Xà Ngược (Inverted Row)" },
        { id: 202, name: "Nằm Vớt Tạ (Dumbbell Pullover)" },
        { id: 417, name: "Ép Cáp Từ Cao Đến Thấp" },
    ],

    erector: [
        { id: 96,  name: "Deadlift Với Tạ Đòn" },
        { id: 270, name: "Siêu Nhân (Superman)" },
        { id: 21,  name: "Romanian Deadlift Với Tạ Đòn" },
    ],

    glutes: [
        { id: 39,  name: "Hip Thrust Với Tạ Đòn" },
        { id: 271, name: "Cầu Mông (Glute Bridge)" },
        { id: 272, name: "Đá Chân Sang Bên (Fire Hydrant)" },
        { id: 16,  name: "Squat Với Tạ Đòn" },
        { id: 96,  name: "Deadlift Với Tạ Đòn" },
        { id: 176, name: "Kéo Cáp Qua Chân (Pull Through)" },
        { id: 199, name: "Vung Tạ Ấm (Kettlebell Swing)" },
    ],

    hamstrings: [
        { id: 21,  name: "Romanian Deadlift Với Tạ Đòn" },
        { id: 133, name: "Cuốn Chân Nằm Với Máy" },
        { id: 96,  name: "Deadlift Với Tạ Đòn" },
        { id: 176, name: "Kéo Cáp Qua Chân (Pull Through)" },
    ],

    lowerback: [
        { id: 96,  name: "Deadlift Với Tạ Đòn" },
        { id: 270, name: "Siêu Nhân (Superman)" },
        { id: 21,  name: "Romanian Deadlift Với Tạ Đòn" },
    ],
};
