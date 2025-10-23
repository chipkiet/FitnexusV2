<<<<<<< HEAD
import { Router } from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const router = Router();

// --- 1. Cấu hình Multer để lưu file tạm thời ---
// Đảm bảo thư mục uploads tồn tại trong thư mục backend
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

// --- 2. Lấy URL của AI Service từ biến môi trường (hoặc dùng giá trị mặc định) ---
const AI_API_URL =
  process.env.AI_API_URL || "http://127.0.0.1:8000/analyze-image/";

// --- 3. Định nghĩa endpoint ---
// Endpoint này sẽ được truy cập qua '/api/trainer/upload' do đã cấu hình trong app.js
router.post("/upload", upload.single("image"), async (req, res, next) => {
  // `upload.single('image')` là middleware xử lý file có field name là 'image'

  // Kiểm tra xem có file nào được tải lên không
  if (!req.file) {
    const err = new Error("No image file uploaded.");
    err.status = 400; // Bad Request
    return next(err); // Chuyển lỗi đến global error handler
  }

  const imagePath = req.file.path;

  try {
    // Tạo một FormData object để gửi file đến Python API
    const formData = new FormData();
    formData.append(
      "file",
      fs.createReadStream(imagePath),
      req.file.originalname
    );

    console.log(
      `[Trainer] Forwarding image to Python AI service at ${AI_API_URL}...`
    );

    // Gửi request POST đến Python service bằng axios
    const response = await axios.post(AI_API_URL, formData, {
      headers: {
        ...formData.getHeaders(), // Lấy header cần thiết cho multipart/form-data
      },
      // Đặt timeout 3 phút để AI có đủ thời gian xử lý
      timeout: 180000,
    });

    console.log("[Trainer] Received response from AI service successfully.");

    // Gửi lại kết quả từ Python cho client React với format chuẩn
    res.status(200).json({
      success: true,
      message: "Image analyzed successfully.",
      data: response.data,
    });
  } catch (error) {
    // Xử lý lỗi một cách chi tiết khi không thể gọi được AI Service
    const errorMessage = error.response
      ? error.response.data.detail || JSON.stringify(error.response.data)
      : error.message;
    console.error("[Trainer] Error calling AI service:", errorMessage);

    const err = new Error("Failed to process image with AI service.");
    err.status = 502; // 502 Bad Gateway - Lỗi khi giao tiếp với server khác
    err.errors = [{ details: errorMessage }]; // Thêm chi tiết lỗi để frontend có thể hiển thị
    return next(err); // Chuyển lỗi đến global error handler
  } finally {
    // Luôn luôn xóa file tạm sau khi đã xử lý xong, dù thành công hay thất bại
    fs.unlinkSync(imagePath);
  }
});

export default router;
=======
import express from 'express';
import authGuard from '../middleware/auth.guard.js';
import { requireTrainer } from '../middleware/role.guard.js';

const router = express.Router();

// GET /api/trainer/tools - TRAINER or ADMIN
router.get('/tools', authGuard, requireTrainer, (req, res) => {
  res.json({ success: true, message: 'Trainer tools accessible', timestamp: new Date().toISOString() });
});

export default router;

>>>>>>> main
