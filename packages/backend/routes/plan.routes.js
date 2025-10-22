import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import { createPlan, getPlanById, addExerciseToPlan } from "../controllers/plan.controller.js";

const router = Router();

router.post("/", authGuard, createPlan);

router.get("/:planId", authGuard, getPlanById);

router.post("/:planId/exercises", authGuard, addExerciseToPlan);

export default router;

