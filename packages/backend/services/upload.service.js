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
  console.warn(
    "[Env] SUPABASE_URL or SUPABASE_SERVICE_KEY missing. Supabase image upload features are disabled."
  );
}

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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
  if (!supabase) {
    console.warn(`[Upload] Supabase client is not initialized. Falling back to Local storage for "${originalName}".`);
    // Pass the bucketName as a root folder in local storage to keep it organized
    return uploadBufferToLocal(fileBuffer, originalName, `${bucketName}/${folderName}`);
  }

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
    console.error(`Supabase Upload Error (${bucketName}):`, error.message, "Falling back to Local Storage.");
    return uploadBufferToLocal(fileBuffer, originalName, `${bucketName}/${folderName}`);
  }
};

/**
 * Upload một file buffer vào thư mục local 'uploads'
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @param {string} folderName 
 * @returns {Promise<string>} - URL của file (ví dụ: /uploads/images/filename.jpg)
 */
export const uploadBufferToLocal = async (
  fileBuffer,
  originalName,
  folderName = "misc"
) => {
  try {
    const fileExt = path.extname(originalName);
    const uniqueFileName = `${path.basename(
      originalName,
      fileExt
    )}-${Date.now()}${fileExt}`;

    // Tạo thư mục nếu chưa tồn tại
    const targetDir = path.join(__dirname, "../uploads", folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);

    // Trả về relative URL mà Express static sẽ phục vụ
    // Ví dụ: /uploads/images/unique-file-123.jpg
    const publicUrl = `/uploads/${folderName}/${uniqueFileName}`;
    return publicUrl;
  } catch (error) {
    console.error("[Upload Local Error]:", error.message);
    return null;
  }
};

export const uploadLocalFileToSupabase = async (
  localFilePath,
  bucketName = "exercises_image",
  folderName = "misc"
) => {
  if (!fs.existsSync(localFilePath)) {
    console.error(`[Upload] Local file not found: ${localFilePath}`);
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    const originalName = path.basename(localFilePath);
    return await uploadBufferToSupabase(fileBuffer, originalName, bucketName, folderName);
  } catch (error) {
    console.error(`[Upload] Local file upload error:`, error.message);
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
