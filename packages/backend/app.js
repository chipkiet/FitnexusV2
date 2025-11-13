import bodyParser from "body-parser";
import express from "express";
import dns from "dns";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import workoutRouter from "./routes/workout.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "./config/passport.js";

import adminUsersRoutes from "./routes/users.routes.js";
import googleAuthRoutes from "./routes/auth.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import trainerRouter from "./routes/trainer.routes.js";
import exerciseRouter from "./routes/exercise.routes.js";
import planRouter from "./routes/plan.routes.js";
import onboardingRouter from "./routes/onboarding.routes.js";
import nutritionRouter from "./routes/nutrition.routes.js";
import billingRouter from "./routes/billing.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import adminMetricsRoutes from "./routes/admin.metrics.routes.js";
import adminRevenueRoutes from "./routes/admin.revenue.routes.js";
import supportRouter from "./routes/support.routes.js";
import notificationRouter from "./routes/notification.routes.js";

import activityTracker from "./middleware/activity.tracker.js";

dotenv.config();

/* -------------------- INIT APP -------------------- */
const app = express();
const isDev = process.env.NODE_ENV !== "production";
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

/* -------------------- ALLOWED ORIGINS -------------------- */
const defaultDevOrigins = [
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5178",
  "http://localhost:5179",
];

const envAdditionalOrigins = (process.env.ADDITIONAL_CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    FRONTEND,
    ...(envAdditionalOrigins.length ? envAdditionalOrigins : defaultDevOrigins),
  ])
);

/* -------------------- IPv4 PRIORITY -------------------- */
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {}

/* -------------------- PAYOS RAW BODY -------------------- */
app.use("/api/payment/payos-webhook", bodyParser.raw({ type: "*/*" }));

/* -------------------- BODY PARSER & COOKIE -------------------- */
app.use(cookieParser());
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

/* -------------------- CORS (PHẢI ĐẶT TRƯỚC ROUTES) -------------------- */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

/* -------------------- SECURITY & LOGGER -------------------- */
app.use(helmet());

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(isDev ? "dev" : "combined", {
      skip: (req, res) => {
        const url = req.originalUrl || "";
        const isRedirect = [301, 302, 307, 308].includes(res.statusCode);
        const isAsset =
          url.startsWith("/assets") ||
          url.startsWith("/static") ||
          url.includes("favicon.ico");
        return isDev && (isRedirect || isAsset);
      },
    })
  );
}

/* -------------------- SESSION -------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

/* -------------------- PASSPORT -------------------- */
app.use(passport.initialize());
app.use(passport.session());

/* -------------------- RATE LIMITER -------------------- */
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 60 * 1000,
    max: isDev ? 1000 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

/* -------------------- ROUTES -------------------- */

// ❗ ROUTE DELETE USER – đặt đúng chỗ
app.use("/api/admin/users", adminUsersRoutes);

app.use("/auth", googleAuthRoutes);
app.use("/api/auth", authRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/billing", billingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/support", supportRouter);
app.use("/api/notifications", notificationRouter);

app.use("/api/admin/revenue", adminRevenueRoutes);
app.use("/api/admin/metrics", adminMetricsRoutes);

app.use("/api", activityTracker);
app.use("/api/admin", adminRouter);
app.use("/api/trainer", trainerRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/plans", planRouter);
app.use("/api/workout", workoutRouter);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- ROOT -------------------- */
app.get("/", (_req, res) => {
  res.json({ message: "Chào mừng các tình yêu đã đến với web của anh 💕" });
});

/* -------------------- REDIRECT DEV -------------------- */
if (isDev && FRONTEND) {
  app.get(/^\/(?!api|auth|static|assets|uploads).*/, (req, res) => {
    res.redirect(`${FRONTEND}${req.originalUrl}`);
  });
}

/* -------------------- 404 -------------------- */
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, _req, res, _next) => {
  if (isDev) console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 500 && !isDev ? "Internal server error" : err.message,
    errors: err.errors || [],
    ...(isDev ? { stack: err.stack } : {}),
  });
});

export default app;
