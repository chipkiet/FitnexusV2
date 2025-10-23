import { Router } from "express";
import { getAllExercises, getExercisesByMuscleGroup, getExerciseStepsById, getExerciseStepsBySlug, getExercisesByType } from "../controllers/exercise.controller.js";

const router = Router();

router.get("/", getAllExercises);

router.get("/muscle/:muscleGroup", getExercisesByMuscleGroup);

router.get("/type/:type", getExercisesByType);

router.get("/id/:exerciseId/steps", getExerciseStepsById);

router.get("/slug/:slug/steps", getExerciseStepsBySlug);



export default router;
