import UserScreenshot from "../models/user.screenshot.model.js";
import { supabase } from "../lib/supabase.js";

export async function uploadScreenshot(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    // Multer đọc file buffer từ req.file
    const file = req.file;
    const { feature, description } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "Missing file" });
    }

    if (!feature || String(feature).trim() === "") {
      return res
        .status(422)
        .json({ success: false, message: "feature is required" });
    }

    const timestamp = Date.now();
    const ext =
      file.originalname?.split(".").pop() ||
      file.mimetype.split("/").pop() ||
      "png";

    const objectKey = `user_${userId}/${timestamp}.${ext}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(objectKey, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload screenshot",
      });
    }

    // Lấy public URL
    const { data: publicData } = supabase.storage
      .from("screenshots")
      .getPublicUrl(objectKey);

    const imageUrl = publicData?.publicUrl || null;

    // Lưu database
    const record = await UserScreenshot.create({
      user_id: userId,
      object_key: objectKey,
      feature,
      description: description || null,
      status: "active",
      is_favorite: false,
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      data: {
        id: record.id,
        feature: record.feature,
        description: record.description,
        image_url: imageUrl,
        object_key: objectKey,
        created_at: record.created_at,
      },
    });
  } catch (err) {
    console.error("uploadScreenshot error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function listScreenshots(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    const feature = req.query?.feature;
    const page = Math.max(parseInt(req.query?.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query?.limit, 10) || 20, 1),
      100
    );

    const where = { user_id: userId, status: "active" };
    if (feature) where.feature = feature;

    const offset = (page - 1) * limit;

    const { rows, count } = await UserScreenshot.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const items = rows.map((r) => ({
      id: r.id,
      feature: r.feature,
      description: r.description,
      image_url: supabase.storage.from("screenshots").getPublicUrl(r.object_key)
        .data.publicUrl,
      is_favorite: r.is_favorite,
      created_at: r.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total: count,
        },
      },
    });
  } catch (err) {
    console.error("listScreenshots error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
