import { Router } from "express";
import { getAllExercises, getExercisesByMuscleGroup, getExerciseStepsById, getExerciseStepsBySlug, getExercisesByType, getExerciseAiAdvice } from "../controllers/exercise.controller.js";

const router = Router();

router.get("/", getAllExercises);

router.get("/muscle/:muscleGroup", getExercisesByMuscleGroup);

router.get("/type/:type", getExercisesByType);

router.get("/id/:exerciseId/steps", getExerciseStepsById);

router.get("/slug/:slug/steps", getExerciseStepsBySlug);

// Gemini-powered summary and advice over current exercises
router.get("/ai/advice", getExerciseAiAdvice);



export default router;
