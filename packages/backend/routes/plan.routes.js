import { Router } from "express";
import authOrSession from "../middleware/authOrSession.guard.js";
import { createPlan, getPlanById, addExerciseToPlan, listMyPlans } from "../controllers/plan.controller.js";

const router = Router();

// List my plans with ?mine=1
// Accept both JWT (mobile/web) and Passport session (OAuth) for plan APIs
router.get("/", authOrSession, listMyPlans);

router.post("/", authOrSession, createPlan);

router.get("/:planId", authOrSession, getPlanById);

router.post("/:planId/exercises", authOrSession, addExerciseToPlan);

export default router;
