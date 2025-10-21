import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import { createPlan, getPlanById, addExerciseToPlan } from "../controllers/plan.controller.js";

const router = Router();

// Create a new workout plan
router.post("/", authGuard, createPlan);

// Get plan detail (metadata + items)
router.get("/:planId", authGuard, getPlanById);

// Add an exercise to the plan
router.post("/:planId/exercises", authGuard, addExerciseToPlan);

export default router;

