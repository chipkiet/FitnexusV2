import { supabase } from "../lib/supabase.js";
import path from "path";

// Không cần gọi dotenv ở đây nữa nếu đã có trong main app hoặc lib/supabase
// Nhưng để chắc chắn lib/supabase lấy được env, có thể cần đảm bảo nó được config

/**
 * Upload một file từ buffer lên Supabase
 * @param {Buffer} fileBuffer - Dữ liệu file
 * @param {string} originalName - Tên file gốc
 * @param {string} bucketName - Tên bucket (mặc định exercises_image)
 * @param {string} folderName - Thư mục con
 * @returns {Promise<string>} - URL công khai của file
 */

export const uploadBufferToSupabase = async (
  fileBuffer,
  originalName,
  bucketName = "exercises_image", // Mặc định nếu không truyền
  folderName = "misc" // Mặc định thư mục con
) => {
  try {
    if (!supabase) {
      console.warn(`[Supabase] Skip upload ${originalName}: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing.`);
      return null;
    }
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
