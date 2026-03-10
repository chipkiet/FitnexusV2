import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import authOrSession from "../middleware/authOrSession.guard.js";
import {
    getActiveSession,
    createWorkoutSession,
    restartSession,
    listWorkoutSessions,
    completeSession,
    getCurrentExercise,
    completeCurrentExercise,
    skipCurrentExercise,
    getSessionDetail,
    logSet,
} from "../controllers/workout.controller.js";

const router = Router();

router.get("/active", authOrSession, getActiveSession)

router.post("/", authOrSession, createWorkoutSession);

router.post("/:sessionId/restart", authOrSession, restartSession);

// Run mode: current exercise helpers
router.get("/:sessionId/current", authOrSession, getCurrentExercise);
router.post("/:sessionId/current/complete", authOrSession, completeCurrentExercise);
router.post("/:sessionId/current/skip", authOrSession, skipCurrentExercise);

router.post("/:sessionId/complete", authOrSession, completeSession);

// List sessions (history / active)
router.get("/", authOrSession, listWorkoutSessions);

// Workout Logging — new endpoints
router.get("/:sessionId/detail", authOrSession, getSessionDetail);
router.post("/:sessionId/exercises/:sessionExerciseId/sets", authOrSession, logSet);

export default router;
