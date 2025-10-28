import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import {
    getActiveSession,
    createWorkoutSession,
    restartSession,
    // Detail/list
    // getWorkoutSession,
    // listWorkoutSessions,
    // Progress
    // updateSessionProgress,
    // pauseSession,
    // resumeSession,
    completeSession,
    // cancelSession,
    // Sets
    // createSet,
    // updateSet,
    // deleteSet,
    // Skip exercise
    // skipExercise,
    // Run mode (current exercise)
    getCurrentExercise,
    completeCurrentExercise,
    skipCurrentExercise,
} from "../controllers/workout.controller.js";

const router = Router();

router.get("/active", authGuard, getActiveSession)

router.post("/", authGuard, createWorkoutSession);

router.post("/:sessionId/restart", authGuard, restartSession);

// Run mode: current exercise helpers
router.get("/:sessionId/current", authGuard, getCurrentExercise);
router.post("/:sessionId/current/complete", authGuard, completeCurrentExercise);
router.post("/:sessionId/current/skip", authGuard, skipCurrentExercise);

router.post("/:sessionId/complete", authGuard, completeSession);


/*
// Xem lịch sử các buổi tập, các buổi tập đã hoàn thành
router.get("/", authGuard, listWorkoutSessions)

// Lấy chi tiết 1 session, có gì trong session này
router.get("/:sessionId", authGuard, getWorkoutSession);

// Cập nhật vị trí bài tập hiện tại -  user có thể next hoặc previous
router.patch("/:sessionId/progress", authGuard, updateSessionProgress);

// Tạm dừng buổi tập
router.patch("/:sessionId/pause", authGuard, pauseSession);

//Tiếp tục buổi tập đã pause
router.patch("/:sessionId/resume", authGuard, resumeSession);

//Hoàn thành buổi tập
router.post("/:sessionId/complete", authGuard, completeSession);

// Hủy buổi tập (không hoàn thành)
router.post("/:sessionId/cancel", authGuard, cancelSession);

//Bỏ qua 1 bài tập
router.post("/:sessionId/exercises/:exerciseId/skip", authGuard, skipExercise);

//Ghi nhận set vừa hoàn thành
router.post("/:sessionId/sets", authGuard, createSet);

// Sửa set đã nhập (nếu nhầm)
router.patch("/:sessionId/sets/:setId", authGuard, updateSet);

//Xóa set nhập nhầm
router.delete("/:sessionId/sets/:setId", authGuard, deleteSet);

*/
export default router;
