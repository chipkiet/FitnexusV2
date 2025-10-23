import { Router } from "express";
import { getAllExercises, getExercisesByMuscleGroup, getExerciseStepsById, getExerciseStepsBySlug, getExercisesByType } from "../controllers/exercise.controller.js";

const router = Router();

// Get all exercises
router.get("/", getAllExercises);

// Get exercises by muscle group
router.get("/muscle/:muscleGroup", getExercisesByMuscleGroup);

// Get exercises by type (compound | isolation | cardio | flexibility)
router.get("/type/:type", getExercisesByType);

// (Removed) multi-group combination endpoint — re-add when needed

// Get steps by exercise id or slug
router.get("/id/:exerciseId/steps", getExerciseStepsById);
router.get("/slug/:slug/steps", getExerciseStepsBySlug);

export default router;
