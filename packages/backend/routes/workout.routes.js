import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import {
    getActiveSession,
    // createWorkoutSession,
    // getWorkoutSession,
    // listWorkoutSessions,
    // updateSessionProgress,
    // pauseSession,
    // resumeSession,
    // completeSession,
    // cancelSession,
    // createSet,
    // updateSet,
    // deleteSet,
    // skipExercise,
} from "../controllers/workout.controller.js";

const router = Router();

// Lấy session đang tập hiện tại , kiểm tra có session nào đang dở không ?
router.get("/active", authGuard, getActiveSession)

// Nếu không có session workout, tạo workout mới hiện tại
// router.post("/", authGuard, createWorkoutSession);

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