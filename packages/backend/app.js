// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const isDev = process.env.NODE_ENV !== "production";

// --- Security middlewares
app.use(helmet());

// --- Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(isDev ? "dev" : "combined"));
}

// --- Cookies
app.use(cookieParser());

// --- CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Body parsers (200kb)
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

// --- Rate limit cho tất cả /api/auth/*
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10, // 10 req / IP / phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    errors: [],
  },
});

// --- Routes
app.use("/api/auth", authLimiter, authRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "Chào mừng các tình yêu đã đến với web của anh" });
});

// --- 404
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: [],
  });
});

// --- Global error handler (không lộ stack ở production)
app.use((err, _req, res, _next) => {
  if (isDev) {
    // Log đầy đủ khi dev
    // eslint-disable-next-line no-console
    console.error("Global error:", err);
  }
  const status = err.status || 500;
  const safeMessage =
    status === 500 && !isDev ? "Internal server error" : err.message;

  // Đảm bảo format lỗi chuẩn
  res.status(status).json({
    success: false,
    message: safeMessage || "Internal server error",
    errors: Array.isArray(err.errors) ? err.errors : [],
    ...(isDev ? { stack: err.stack } : {}),
  });
});

export default app;
