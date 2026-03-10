// This file serves as the database simulator containing our mock data.
// Later, this data will live in a real database.

export const mockExercisesDataset = {
    // 5 requested mock dataset groups
    "chest": ["Bench Press", "Incline Dumbbell Press", "Chest Fly"],
    "biceps": ["Barbell Curl", "Hammer Curl", "Concentration Curl"],
    "triceps": ["Triceps Pushdown", "Skull Crusher", "Dips"],
    "shoulders": ["Overhead Press", "Lateral Raise", "Front Raise"],
    "back": ["Pull-up", "Lat Pulldown", "Seated Row"],
    
    // Additional mapping for the current interactive body parts
    "abs": ["Crunches", "Plank", "Leg Raises"],
    "forearms": ["Wrist Curls", "Reverse Curls", "Farmer's Walk"],
    "quads": ["Squats", "Leg Press", "Lunges"],
    "calves": ["Calf Raises", "Jump Rope", "Running"],
    "traps": ["Shrugs", "Upright Rows", "Face Pulls"]
};
