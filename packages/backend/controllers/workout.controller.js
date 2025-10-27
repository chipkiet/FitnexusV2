import WorkoutSession from "../models/workout.session.model.js";
import WorkoutSessionExercise from "../models/workout.session.exercise.model.js";
import WorkoutSessionSet from "../models/workout.session.set.model.js";
import Exercise from "../models/exercise.model.js";
import WorkoutPlan from "../models/workout.plan.model.js";
import { Op } from "sequelize";

/**
 * GET /api/workout/active
 * Lấy session đang active (in_progress hoặc paused) của user
 * Use case:
 * - Resume workout khi mở lại app
 * - Kiểm tra xem có session đang dở không trước khi tạo mới
 */
export async function getActiveSession(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Tìm session đang in_progress hoặc paused
        const session = await WorkoutSession.findOne({
            where: {
                user_id: userId,
                status: {
                    [Op.in]: ['in_progress', 'paused']
                }
            },
            order: [['started_at', 'DESC']], // Lấy session gần nhất
            include: [
                {
                    model: WorkoutPlan,
                    as: 'plan',
                    attributes: ['plan_id', 'name', 'description'],
                    required: false, // LEFT JOIN - vì plan có thể null
                }
            ],
        });

        // Nếu không có session active
        if (!session) {
            return res.status(200).json({
                success: true,
                data: null, // Không có session đang dở
                message: "No active session found"
            });
        }

        // Có session active → lấy chi tiết exercises và sets
        const exercises = await WorkoutSessionExercise.findAll({
            where: { session_id: session.session_id },
            order: [['session_order', 'ASC']],
            include: [
                {
                    model: Exercise,
                    as: 'exercise',
                    attributes: [
                        'exercise_id',
                        'name',
                        'difficulty_level',
                        'equipment_needed',
                        'thumbnail_url',
                        'gif_demo_url',
                    ],
                },
                {
                    model: WorkoutSessionSet,
                    as: 'sets',
                    order: [['set_index', 'ASC']],
                    required: false, // LEFT JOIN - exercise có thể chưa có set nào
                }
            ],
        });

        // Format response
        const responseData = {
            session: {
                session_id: session.session_id,
                plan_id: session.plan_id,
                plan_name: session.plan?.name || null,
                status: session.status,
                started_at: session.started_at,
                current_exercise_index: session.current_exercise_index,
                notes: session.notes,
            },
            exercises: exercises.map(ex => ({
                session_exercise_id: ex.session_exercise_id,
                exercise_id: ex.exercise_id,
                session_order: ex.session_order,
                target_sets: ex.target_sets,
                target_reps: ex.target_reps,
                target_rest_seconds: ex.target_rest_seconds,
                completed_sets: ex.completed_sets,
                status: ex.status,
                exercise: {
                    exercise_id: ex.exercise?.exercise_id,
                    name: ex.exercise?.name,
                    difficulty_level: ex.exercise?.difficulty_level,
                    equipment_needed: ex.exercise?.equipment_needed,
                    image_url: ex.exercise?.thumbnail_url || ex.exercise?.gif_demo_url,
                },
                sets: (ex.sets || []).map(set => ({
                    set_id: set.set_id,
                    set_index: set.set_index,
                    actual_reps: set.actual_reps,
                    actual_weight_kg: set.actual_weight_kg,
                    rest_seconds: set.rest_seconds,
                    completed_at: set.completed_at,
                    notes: set.notes,
                })),
            })),
            summary: {
                total_exercises: exercises.length,
                completed_exercises: exercises.filter(ex => ex.status === 'completed').length,
                current_exercise: exercises[session.current_exercise_index] || null,
            }
        };

        return res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (err) {
        console.error("getActiveSession error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}