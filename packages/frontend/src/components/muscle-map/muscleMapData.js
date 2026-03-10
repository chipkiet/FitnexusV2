export const defaultStyle = {
    preFillColor: "transparent",
    fillColor: "rgba(59, 130, 246, 0.25)",
    strokeColor: "transparent",
    strokeWidth: 0
};

// ─── Front Body Map ───────────────────────────────────────────────────────────

export const bodyMapFront = {
    name: "male-front-map",
    areas: [
        { id: "chest", name: "Cơ ngực (Pectorals)", shape: "poly", coords: [143, 139, 136, 143, 130, 149, 127, 155, 121, 160, 117, 170, 115, 177, 116, 184, 118, 190, 124, 195, 128, 202, 134, 204, 142, 205, 148, 205, 156, 204, 164, 202, 171, 200, 176, 194, 184, 196, 192, 199, 199, 202, 209, 204, 216, 204, 223, 206, 230, 206, 238, 201, 242, 192, 246, 183, 246, 173, 242, 163, 238, 155, 229, 147, 220, 140], ...defaultStyle },
        { id: "abs_center", name: "Cơ bụng (Abs)", shape: "poly", coords: [176, 207, 167, 209, 158, 213, 153, 217, 149, 222, 151, 227, 151, 242, 151, 247, 151, 252, 152, 264, 151, 272, 157, 276, 162, 278, 169, 279, 175, 278, 187, 279, 195, 279, 203, 276, 210, 272, 209, 263, 210, 243, 211, 219, 203, 212, 191, 209, 184, 208], ...defaultStyle },
        { id: "abs_right", name: "Cơ bụng (Abs)", shape: "poly", coords: [125, 238, 127, 251, 127, 261, 126, 273, 124, 285, 126, 293, 135, 300, 141, 303, 148, 300, 148, 290, 146, 277, 145, 265, 143, 257, 136, 247], ...defaultStyle },
        { id: "abs_left", name: "Cơ bụng (Abs)", shape: "poly", coords: [237, 239, 234, 258, 235, 268, 236, 279, 237, 287, 235, 292, 227, 302, 217, 304, 213, 298, 214, 286, 215, 274, 217, 264, 217, 257], ...defaultStyle },
        { id: "shoulders_right", name: "Cơ vai (Deltoids)", shape: "poly", coords: [113, 132, 98, 139, 94, 145, 88, 155, 84, 165, 83, 180, 85, 189, 89, 193, 96, 189, 107, 179, 113, 172, 117, 160, 125, 148, 135, 138, 125, 134], ...defaultStyle },
        { id: "shoulders_left", name: "Cơ vai (Deltoids)", shape: "poly", coords: [233, 135, 252, 133, 259, 138, 268, 144, 272, 151, 276, 162, 277, 172, 278, 183, 275, 191, 266, 191, 257, 182, 251, 176, 230, 141], ...defaultStyle },
        { id: "biceps_right", name: "Cơ tay trước (Biceps)", shape: "poly", coords: [111, 183, 101, 188, 95, 194, 91, 202, 86, 211, 84, 224, 84, 236, 83, 244, 84, 249, 90, 252, 100, 249, 109, 242, 116, 229, 116, 217, 119, 192], ...defaultStyle },
        { id: "biceps_left", name: "Cơ tay trước (Biceps)", shape: "poly", coords: [246, 185, 244, 198, 244, 213, 246, 221, 250, 232, 255, 239, 260, 245, 268, 251, 275, 249, 280, 238, 278, 227, 275, 213, 270, 198, 261, 188], ...defaultStyle },
        { id: "forearms_right", name: "Cơ cẳng tay (Forearms)", shape: "poly", coords: [74, 241, 67, 252, 61, 266, 58, 278, 59, 289, 54, 309, 49, 329, 57, 329, 62, 331, 70, 336, 74, 328, 81, 317, 90, 304, 96, 289, 100, 280, 105, 256, 84, 266], ...defaultStyle },
        { id: "forearms_left", name: "Cơ cẳng tay (Forearms)", shape: "poly", coords: [288, 241, 299, 265, 303, 284, 307, 307, 312, 328, 298, 330, 291, 336, 282, 323, 269, 298, 263, 281, 257, 256, 278, 266], ...defaultStyle },
        { id: "quads_right", name: "Cơ đùi trước (Quadriceps)", shape: "poly", coords: [134, 317, 134, 332, 122, 361, 111, 377, 111, 417, 113, 442, 120, 460, 128, 466, 134, 458, 140, 455, 143, 465, 147, 473, 153, 474, 165, 463, 166, 440, 173, 418, 176, 397, 177, 371, 166, 362, 161, 348, 150, 331], ...defaultStyle },
        { id: "quads_left", name: "Cơ đùi trước (Quadriceps)", shape: "poly", coords: [228, 315, 227, 330, 235, 353, 249, 381, 250, 405, 248, 443, 241, 460, 231, 466, 220, 456, 216, 475, 206, 474, 196, 463, 196, 443, 189, 414, 184, 389, 184, 373, 192, 367, 199, 346], ...defaultStyle },
        { id: "calves_right", name: "Cơ bắp chân (Calves)", shape: "poly", coords: [121, 500, 114, 537, 118, 573, 127, 613, 134, 611, 141, 608, 150, 590, 161, 553, 159, 528, 156, 513], ...defaultStyle },
        { id: "calves_left", name: "Cơ bắp chân (Calves)", shape: "poly", coords: [242, 498, 205, 512, 199, 546, 213, 590, 223, 607, 235, 612, 245, 565, 247, 537], ...defaultStyle },
        { id: "traps", name: "Cơ cầu vai (Trapezius)", shape: "poly", coords: [157, 112, 205, 112, 205, 134, 158, 135], ...defaultStyle }
    ]
};

// Kept for backward compatibility
export const bodyMap = bodyMapFront;

// ─── Muscle Info Map ──────────────────────────────────────────────────────────

export const muscleInfoMap = {
    chest: {
        name: "Pectorals",
        nameVi: "Ngực",
        icon: "💪",
        exercises: ["Bench Press", "Push Ups", "Chest Fly", "Incline Dumbbell Press"]
    },
    abs: {
        name: "Abs",
        nameVi: "Bụng",
        icon: "🍫",
        exercises: ["Crunches", "Plank", "Leg Raises", "Russian Twists"]
    },
    shoulders: {
        name: "Deltoids",
        nameVi: "Vai",
        icon: "🦍",
        exercises: ["Overhead Press", "Lateral Raises", "Front Raises", "Arnold Press"]
    },
    biceps: {
        name: "Biceps",
        nameVi: "Tay trước",
        icon: "🦾",
        exercises: ["Bicep Curls", "Hammer Curls", "Chin Ups", "Concentration Curl"]
    },
    forearms: {
        name: "Forearms",
        nameVi: "Cẳng tay",
        icon: "✊",
        exercises: ["Wrist Curls", "Reverse Curls", "Farmer's Walk"]
    },
    quads: {
        name: "Quadriceps",
        nameVi: "Đùi trước",
        icon: "🦵",
        exercises: ["Squats", "Leg Press", "Lunges", "Leg Extension"]
    },
    calves: {
        name: "Calves",
        nameVi: "Bắp chân",
        icon: "🏃",
        exercises: ["Calf Raises", "Jump Rope", "Running"]
    },
    traps: {
        name: "Trapezius",
        nameVi: "Cầu vai",
        icon: "🤷",
        exercises: ["Shrugs", "Upright Rows", "Face Pulls"]
    },
    // Back view muscles
    trapezius: {
        name: "Trapezius",
        nameVi: "Cầu vai (sau)",
        icon: "🤷",
        exercises: ["Shrugs", "Upright Rows", "Face Pulls", "Cable Shrugs"]
    },
    rear_deltoids: {
        name: "Rear Deltoids",
        nameVi: "Vai sau",
        icon: "🫱",
        exercises: ["Face Pulls", "Reverse Fly", "Bent-Over Lateral Raise"]
    },
    triceps: {
        name: "Triceps",
        nameVi: "Tay sau",
        icon: "💪",
        exercises: ["Triceps Pushdown", "Skull Crusher", "Dips", "Overhead Tricep Extension"]
    },
    erector: {
        name: "Erector Spinae",
        nameVi: "Cơ dựng sống",
        icon: "🔩",
        exercises: ["Deadlift", "Hyperextension", "Good Mornings", "Superman"]
    },
    lats: {
        name: "Latissimus Dorsi",
        nameVi: "Lưng rộng",
        icon: "🏋️",
        exercises: ["Pull-ups", "Lat Pulldown", "Seated Row", "Single-Arm Row"]
    },
    glutes: {
        name: "Glutes",
        nameVi: "Mông",
        icon: "🍑",
        exercises: ["Hip Thrust", "Squats", "Deadlift", "Glute Bridge"]
    },
    hamstrings: {
        name: "Hamstrings",
        nameVi: "Đùi sau",
        icon: "🦵",
        exercises: ["Romanian Deadlift", "Leg Curl", "Good Mornings"]
    },
    lowerback: {
        name: "Lower Back",
        nameVi: "Lưng dưới",
        icon: "🔩",
        exercises: ["Deadlift", "Hyperextension", "Good Mornings"]
    }
};

export const getMuscleInfo = (areaId) => {
    if (!areaId) return null;
    // Try exact match first (e.g. "trapezius", "erector_spinae")
    if (muscleInfoMap[areaId]) return muscleInfoMap[areaId];
    // Try progressively shorter prefixes (longest first)
    // This handles IDs like "rear_deltoids_left" → "rear_deltoids"
    const parts = areaId.split('_');
    for (let len = parts.length - 1; len >= 1; len--) {
        const key = parts.slice(0, len).join('_');
        if (muscleInfoMap[key]) return muscleInfoMap[key];
    }
    return null;
};
