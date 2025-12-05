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
  getRelatedExercisesById,
  getExerciseMusclesById,
  listMyFavorites,
  getExerciseFilterMeta,
  getExerciseDetail,
  createExercise,
  exerciseUploadMiddleware,
} from "../controllers/exercise.controller.js";

const router = Router();

router.get("/", getAllExercises);
router.get("/muscle/:muscleGroup", getExercisesByMuscleGroup);
router.get("/type/:type", getExercisesByType);
router.get("/id/:exerciseId/steps", getExerciseStepsById);
router.get("/slug/:slug/steps", getExerciseStepsBySlug);

router.post("/:exerciseId/favorite", authGuard, postFavorite);
router.delete("/:exerciseId/favorite", authGuard, deleteFavorite);
router.get("/:exerciseId/favorite", getFavoriteStatus);
router.get("/favorites", authGuard, listMyFavorites);

router.get("/id/:exerciseId/related", getRelatedExercisesById);

router.get("/id/:exerciseId/muscles", getExerciseMusclesById);

router.get("/filter/meta", getExerciseFilterMeta);

router.get("/detail/:slug", getExerciseDetail);

router.post("/", authGuard, exerciseUploadMiddleware, createExercise);


export default router;
