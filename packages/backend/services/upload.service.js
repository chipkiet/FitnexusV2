import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Lỗi: Không tìm thấy SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong file .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload một file từ đường dẫn local lên Supabase
 * @param {string} localFilePath - Đường dẫn file trên máy tính
 * @param {string} destinationFolder - Thư mục trên cloud
 * @returns {Promise<string>} - URL công khai của file
 */

export const uploadBufferToSupabase = async (
  fileBuffer,
  originalName,
  bucketName = "exercises_image", // Mặc định nếu không truyền
  folderName = "misc" // Mặc định thư mục con
) => {
  try {
    const fileExt = path.extname(originalName);
    // Tạo tên file unique
    const uniqueFileName = `${path.basename(
      originalName,
      fileExt
    )}-${Date.now()}${fileExt}`;

    // Đường dẫn đầy đủ: folder/filename.jpg
    const storagePath = `${folderName}/${uniqueFileName}`;

    // Upload vào bucket được chỉ định
    const { data, error } = await supabase.storage
      .from(bucketName) // <--- Dùng biến dynamic ở đây
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(fileExt),
        upsert: false,
      });

    if (error) throw error;

    // Lấy Public URL từ bucket đó
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error(`Supabase Upload Error (${bucketName}):`, error.message);
    return null;
  }
};


function getContentType(ext) {
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
