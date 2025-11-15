import { Router } from "express";
import multer from "multer";
import authGuard from "../middleware/auth.guard.js";
import {
  uploadScreenshot,
  listScreenshots,
} from "../controllers/user.screenshots.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/user-screenshots
router.post("/", authGuard, upload.single("file"), uploadScreenshot);

// GET /api/user-screenshots
router.get("/", authGuard, listScreenshots);

export default router;
