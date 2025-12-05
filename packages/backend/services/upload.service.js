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

// Kiểm tra xem env đã load được chưa (Optional debug)
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Lỗi: Không tìm thấy SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong file .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "exercises_image"; // Đảm bảo tên bucket này trùng khớp trên Supabase Dashboard

/**
 * Upload một file từ đường dẫn local lên Supabase
 * @param {string} localFilePath - Đường dẫn file trên máy tính
 * @param {string} destinationFolder - Thư mục trên cloud
 * @returns {Promise<string>} - URL công khai của file
 */
export const uploadLocalFileToSupabase = async (
  localFilePath,
  destinationFolder = "misc"
) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const fileName = path.basename(localFilePath);
    const fileExt = path.extname(localFilePath);

    // Tạo tên file unique để tránh trùng lặp
    const uniqueFileName = `${path.basename(
      fileName,
      fileExt
    )}-${Date.now()}${fileExt}`;
    const storagePath = `${destinationFolder}/${uniqueFileName}`;

    const fileBuffer = fs.readFileSync(localFilePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(fileExt),
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Supabase Upload Error : ", error.message);
    return null;
  }
};

/**
 * Upload file từ Buffer (Multer) lên Supabase
 * @param {Buffer} fileBuffer - Dữ liệu file
 * @param {string} originalName - Tên file gốc
 * @param {string} destinationFolder - Thư mục (videos/images)
 */

export const uploadBufferToSupabase = async (
  fileBuffer,
  originalName,
  destinationFolder = "misc"
) => {
  try {
    const fileExt = path.extname(originalName);
    const uniqueFileName = `${path.basename(
      originalName,
      fileExt
    )}-${Date.now()}${fileExt}`;
    const storagePath = `${destinationFolder}/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(fileExt),
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
    return publicData.publicUrl;
  } catch (error) {
    console.error("Supabase Buffer Upload Error:", error.message);
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
