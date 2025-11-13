// packages/backend/services/streak.service.js
import { Op } from "sequelize";
import LoginHistory from "../models/login.history.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

const diffInDays = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
};

export async function recordLoginActivity(user, req = {}) {
  try {
    await LoginHistory.create({
      user_id: user.user_id,
      ip_address: req.ip || null,
      user_agent: (req.headers?.["user-agent"] || "").slice(0, 512),
      os: req.headers?.["sec-ch-ua-platform"] || null,
      browser: req.headers?.["sec-ch-ua"] || null,
    });
  } catch (err) {
    console.warn("recordLoginActivity error:", err?.message || err);
  }
  await updateLoginStreak(user);
}

export async function ensureDailyStreakPing(user, req = {}) {
  if (!user) return { triggered: false };
  const today = new Date();
  const todayKey = toDateKey(today);
  const lastKey = user.login_streak_updated_at
    ? toDateKey(user.login_streak_updated_at)
    : null;
  if (lastKey === todayKey) return { triggered: false };

  try {
    await LoginHistory.create({
      user_id: user.user_id,
      ip_address: req.ip || null,
      user_agent: (req.headers?.["user-agent"] || "").slice(0, 512),
      os: req.headers?.["sec-ch-ua-platform"] || null,
      browser: req.headers?.["sec-ch-ua"] || null,
    });
  } catch (err) {
    console.warn("ensureDailyStreakPing error:", err?.message || err);
  }
  await updateLoginStreak(user);
  return { triggered: true };
}

export async function updateLoginStreak(user) {
  if (!user) return;
  const today = new Date();
  const todayKey = toDateKey(today);
  const lastKey = user.login_streak_updated_at
    ? toDateKey(user.login_streak_updated_at)
    : null;

  let current = user.login_streak || 0;
  if (!lastKey) {
    current = 1;
  } else {
    const diff = diffInDays(todayKey, lastKey);
    if (diff === 0) {
      // already counted today
    } else if (diff === 1) {
      current += 1;
    } else {
      current = 1;
    }
  }

  const best = Math.max(current, user.max_login_streak || 0);
  user.login_streak = current;
  user.max_login_streak = best;
  user.login_streak_updated_at = today;

  await user.save({
    fields: ["login_streak", "max_login_streak", "login_streak_updated_at"],
  });
}

export async function fetchStreakTimeline(userId, days = 10) {
  const safeDays = Math.min(Math.max(Number(days) || 10, 7), 30);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (safeDays - 1));

  const rows = await LoginHistory.findAll({
    where: {
      user_id: userId,
      created_at: { [Op.gte]: since },
    },
    attributes: ["created_at"],
    order: [["created_at", "ASC"]],
  });

  const activeSet = new Set(rows.map((r) => toDateKey(r.created_at)));

  const timeline = [];
  for (let i = safeDays - 1; i >= 0; i--) {
    const point = new Date();
    point.setHours(0, 0, 0, 0);
    point.setDate(point.getDate() - i);
    const key = toDateKey(point);
    timeline.push({
      date: key,
      active: activeSet.has(key),
    });
  }
  return timeline;
}
