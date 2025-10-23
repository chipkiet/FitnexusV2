// routes/auth.js
import express from "express";
import passport from "passport";

const router = express.Router();

/** 1) Bắt đầu OAuth (giữ nguyên) */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

/** 2) Callback -> tạo session cookie -> redirect về FE (giữ nguyên đường dẫn) */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    keepSessionInfo: true, // ✅ quan trọng với passport >= 0.6
  }),
  (req, res) => {
    // Session Passport đã có ở đây
    const url = new URL("/dashboard", process.env.FRONTEND_URL).toString();
    return res.redirect(url);
  }
);

/** 3) Trả user từ session cho FE (giữ nguyên) */
router.get("/me", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");

  if (!(req.isAuthenticated?.() && req.user)) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const plain = typeof req.user?.toJSON === "function" ? req.user.toJSON() : req.user;
  const { passwordHash, providerId, ...safe } = plain || {};
  return res.json({ user: safe });
});

export default router;
