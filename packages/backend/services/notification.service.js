import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export async function notifyUser(userId, { type = "general", title, body = "", metadata = null } = {}) {
  if (!userId || !title) return null;
  try {
    return await Notification.create({
      user_id: userId,
      type,
      title,
      body,
      metadata,
    });
  } catch (err) {
    console.error("notifyUser error:", err?.message || err);
    return null;
  }
}

export async function notifyAdmins(payload = {}) {
  try {
    const admins = await User.findAll({
      where: { role: "ADMIN" },
      attributes: ["user_id"],
    });
    await Promise.all(
      admins.map((admin) => notifyUser(admin.user_id, payload))
    );
  } catch (err) {
    console.error("notifyAdmins error:", err?.message || err);
  }
}
