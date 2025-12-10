// packages/backend/controllers/content.controller.js
import SystemContent from "../models/systemContent.model.js"; // Import Model vừa tạo
import { uploadBufferToSupabase } from "../services/upload.service.js";

// GET
export const getSystemContent = async (req, res) => {
  try {
    const { key } = req.params;

    const record = await SystemContent.findByPk(key); // Tìm theo Primary Key

    if (record) {
      return res.json({ success: true, data: record.content });
    }

    // Fallback nếu chưa có trong DB (trả về null để FE dùng default)
    return res.json({ success: false, message: "No content found" });
  } catch (error) {
    console.error("Get Content Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT
export const updateSystemContent = async (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.userId || req.user?.user_id;

    // 1. Parse JSON từ FormData
    let newContentData = {};
    try {
      newContentData = JSON.parse(req.body.content || "{}");
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid JSON" });
    }

    // 2. Tìm bản ghi cũ (để giữ lại mediaUrl nếu không upload mới)
    let record = await SystemContent.findByPk(key);

    // Nếu chưa có thì tạo mới object rỗng để hứng dữ liệu
    if (!record) {
      record = SystemContent.build({ key, type: "json" });
    }

    // Lấy content cũ ra để merge (phòng khi user chỉ sửa text mà không gửi lại link ảnh cũ)
    const oldContent = record.content || {};

    // 3. Xử lý Upload File
    if (req.file) {
      const publicUrl = await uploadBufferToSupabase(
        req.file.buffer,
        req.file.originalname,
        "content", // Bucket
        "hero" // Folder
      );

      if (publicUrl) {
        newContentData.mediaUrl = publicUrl;

        // Detect loại file
        if (req.file.mimetype.startsWith("video/")) {
          newContentData.mediaType = "video";
        } else if (req.file.mimetype.startsWith("image/")) {
          newContentData.mediaType = "image";
        }
      }
    } else {
      // Nếu không upload file mới, giữ nguyên URL cũ
      if (!newContentData.mediaUrl && oldContent.mediaUrl) {
        newContentData.mediaUrl = oldContent.mediaUrl;
      }
      if (!newContentData.mediaType && oldContent.mediaType) {
        newContentData.mediaType = oldContent.mediaType;
      }
    }

    // 4. Cập nhật và Lưu vào DB
    record.content = newContentData;
    record.updated_by = userId;

    // .save() tự động xử lý INSERT hoặc UPDATE
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
      data: record.content,
    });
  } catch (error) {
    console.error("Update Content Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
