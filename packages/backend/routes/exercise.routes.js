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

// Lấy danh sách bài tập liên quan
router.get("/id/:exerciseId/related", getRelatedExercisesById);

// Lấy thông tin chi tiết nhóm cơ của bài tập
router.get("/id/:exerciseId/muscles", getExerciseMusclesById);

// Trả về thuần metadata
router.get("/filter/meta", getExerciseFilterMeta);

export default router;
