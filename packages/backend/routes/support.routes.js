// packages/backend/routes/support.routes.js
import { Router } from "express";
import multer from "multer";
import authOrSessionGuard from "../middleware/authOrSession.guard.js";
import { submitBugReport } from "../controllers/support.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.post(
  "/report",
  authOrSessionGuard,
  upload.single("screenshot"),
  submitBugReport
);

export default router;
