import { Router } from "express";
import authGuard from "../middleware/auth.guard.js";
import {
	getAllExercises,
	getExercisesByMuscleGroup,
	getExerciseStepsById,
	getExerciseStepsBySlug,
	getExercisesByType,
	postFavorite,
	deleteFavorite,
	getFavoriteStatus,
} from "../controllers/exercise.controller.js";

const router = Router();

router.get("/", getAllExercises);

router.get("/muscle/:muscleGroup", getExercisesByMuscleGroup);

router.get("/type/:type", getExercisesByType);

router.get("/id/:exerciseId/steps", getExerciseStepsById);

router.get("/slug/:slug/steps", getExerciseStepsBySlug);

// Favorites: POST to favorite, DELETE to unfavorite, GET to fetch favorite_count and whether current user favorited
router.post('/:exerciseId/favorite', authGuard, postFavorite);
router.delete('/:exerciseId/favorite', authGuard, deleteFavorite);
router.get('/:exerciseId/favorite', getFavoriteStatus);

export default router;
