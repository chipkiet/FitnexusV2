import WorkoutSession from "../models/workout.session.model.js";
import WorkoutSessionExercise from "../models/workout.session.exercise.model.js";
import WorkoutSessionSet from "../models/workout.session.set.model.js";
import Exercise from "../models/exercise.model.js";
import WorkoutPlan from "../models/workout.plan.model.js";
import { Op } from "sequelize";
import {sequelize} from "../config/database.js";


export async function getActiveSession(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Tìm session đang in_progress hoặc paused (ưu tiên cập nhật gần nhất)
        const session = await WorkoutSession.findOne({
            where: {
                user_id: userId,
                status: {
                    [Op.in]: ['in_progress', 'paused']
                }
            },
            order: [['updated_at', 'DESC'], ['started_at', 'DESC']],
            include: [
                {
                    model: WorkoutPlan,
                    as: 'plan',
                    attributes: ['plan_id', 'name', 'description'],
                    required: false, 
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

        const includeMode = String(req.query.include || 'summary').toLowerCase();
        if (includeMode !== 'full') {
            return res.status(200).json({
                success: true,
                data: {
                    session: {
                        session_id: session.session_id,
                        plan_id: session.plan_id,
                        plan_name: session.plan?.name || null,
                        status: session.status,
                        started_at: session.started_at,
                        current_exercise_index: session.current_exercise_index,
                        notes: session.notes,
                    },
                },
            });
        }

        // Có session active → lấy chi tiết exercises và sets (đủ dữ liệu)
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
                    separate: true,
                    order: [['set_index', 'ASC']],
                    required: false,
                }
            ],
        });

        return res.status(200).json({
            success: true,
            data: {
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
            },
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

export async function createWorkoutSession(req, res) {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.userId;
    if (!userId) {
      await t.rollback();
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const planId = parseInt(req.body?.plan_id, 10);
    const notes = req.body?.notes ? String(req.body.notes).trim() : null;

    if (!Number.isFinite(planId) || planId <= 0) {
      await t.rollback();
      return res.status(422).json({ 
        success: false, 
        message: "plan_id is required and must be a valid number" 
      });
    }

    // ============ 1. KIỂM TRA SESSION ACTIVE ============
    const existingActive = await WorkoutSession.findOne({
      where: {
        user_id: userId,
        status: {
          [Op.in]: ['in_progress', 'paused']
        }
      },
      attributes: ['session_id', 'plan_id', 'status', 'started_at', 'current_exercise_index'],
      include: [{
        model: WorkoutPlan,
        as: 'plan',
        attributes: ['name'],
        required: false
      }],
      transaction: t
    });

    if (existingActive) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "You already have an active workout session",
        data: {
          session_id: existingActive.session_id,
          plan_id: existingActive.plan_id,
          plan_name: existingActive.plan?.name || null,
          status: existingActive.status,
          started_at: existingActive.started_at,
          current_exercise_index: existingActive.current_exercise_index,
          actions: ['resume', 'complete', 'cancel']
        }
      });
    }

    // ============ 2. KIỂM TRA QUYỀN TRUY CẬP PLAN ============
    const plan = await WorkoutPlan.findOne({
      where: { plan_id: planId },
      attributes: ['plan_id', 'name', 'creator_id', 'is_public'],
      transaction: t
    });

    if (!plan) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Plan not found" 
      });
    }

    // Check quyền: phải là creator hoặc plan public
    const hasAccess = plan.creator_id === userId || plan.is_public === true;
    if (!hasAccess) {
      await t.rollback();
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to use this plan" 
      });
    }

    // ============ 3. SNAPSHOT EXERCISES TỪ PLAN ============
    const planExercises = await PlanExerciseDetail.findAll({
      where: { plan_id: planId },
      order: [
        ['session_order', 'ASC'],
        ['plan_exercise_id', 'ASC']
      ],
      attributes: [
        'plan_exercise_id',
        'exercise_id',
        'session_order',
        'sets_recommended',
        'reps_recommended',
        'rest_period_seconds'
      ],
      transaction: t
    });

    // Chuẩn hóa session_order: gán dải tuần tự 1..N
    // để tránh null/duplicate khi insert vào workout_session_exercises
    const normalizedExercises = planExercises.map((ex, index) => ({
      plan_exercise_id: ex.plan_exercise_id,
      exercise_id: ex.exercise_id,
      session_order: index + 1, // 1, 2, 3, ...
      target_sets: ex.sets_recommended,
      target_reps: ex.reps_recommended,
      target_rest_seconds: ex.rest_period_seconds
    }));

    // Edge case: Plan không có exercise
    // Product decision: Vẫn cho tạo session để user có thể thêm exercise sau
    // Nếu muốn block, uncomment dưới:
    // if (normalizedExercises.length === 0) {
    //   await t.rollback();
    //   return res.status(422).json({ 
    //     success: false, 
    //     message: "Plan has no exercises" 
    //   });
    // }

    // ============ 4. TẠO SESSION (TRANSACTION) ============
    const session = await WorkoutSession.create({
      user_id: userId,
      plan_id: planId,
      status: 'in_progress',
      started_at: new Date(),
      current_exercise_index: 0,
      notes: notes
    }, { transaction: t });

    // ============ 5. BULK INSERT SESSION EXERCISES ============
    const sessionExercises = normalizedExercises.map(ex => ({
      session_id: session.session_id,
      plan_exercise_id: ex.plan_exercise_id,
      exercise_id: ex.exercise_id,
      session_order: ex.session_order,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_rest_seconds: ex.target_rest_seconds,
      completed_sets: 0,
      status: 'pending' // Hoặc set exercise đầu tiên = 'in_progress'
    }));

    // Optional: Set exercise đầu tiên là 'in_progress'
    if (sessionExercises.length > 0) {
      sessionExercises[0].status = 'in_progress';
    }

    await WorkoutSessionExercise.bulkCreate(sessionExercises, { 
      transaction: t 
    });

    // ============ 6. COMMIT & RESPONSE ============
    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Workout session created successfully",
      data: {
        session_id: session.session_id,
        plan_id: plan.plan_id,
        plan_name: plan.name,
        exercises_count: sessionExercises.length,
        status: session.status,
        started_at: session.started_at,
        current_exercise_index: session.current_exercise_index
      }
    });

  } catch (err) {
    await t.rollback();
    console.error("createWorkoutSession error:", err);

    // Handle unique constraint violation (race condition)
    if (err.name === 'SequelizeUniqueConstraintError' || 
        err.message?.includes('ws_one_active_per_user_idx')) {
      return res.status(409).json({
        success: false,
        message: "You already have an active workout session. Please complete or cancel it first."
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
  }
}









