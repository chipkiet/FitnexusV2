import express from "express";
import multer from "multer";
import authGuard from "../middleware/auth.guard.js";
import {
  listDashboardReviews,
  createDashboardReview,
  createDashboardReviewComment,
  toggleDashboardReviewHelpful,
  updateDashboardReviewComment,
  deleteDashboardReviewComment,
  deleteDashboardReview,
} from "../controllers/review.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
});

router.get("/", listDashboardReviews);
router.post("/", authGuard, upload.array("images", 3), createDashboardReview);
router.post("/:reviewId/comments", authGuard, upload.array("images", 3), createDashboardReviewComment);
router.post("/:reviewId/helpful", authGuard, toggleDashboardReviewHelpful);
router.patch("/:reviewId/comments/:commentId", authGuard, upload.array("images", 3), updateDashboardReviewComment);
router.delete("/:reviewId/comments/:commentId", authGuard, deleteDashboardReviewComment);
router.delete("/:reviewId", authGuard, deleteDashboardReview);

export default router;
