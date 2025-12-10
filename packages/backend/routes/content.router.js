import { Router } from "express";
import multer from "multer";
import authGuard from "../middleware/auth.guard.js";

import {
  getSystemContent,
  updateSystemContent,
} from "../controllers/content.controller.js";

const router = Router();

// Cấu hình Multer lưu vào RAM để xử lý trước khi upload Supabase
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB cho video
});

// Route Public: Lấy dữ liệu
router.get("/:key", getSystemContent);

// Route Private: Cập nhật (Yêu cầu đăng nhập & upload file)
router.put("/:key", authGuard, upload.single("mediaFile"), updateSystemContent);

export default router;
