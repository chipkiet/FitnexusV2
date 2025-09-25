import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import routers
import authRouter from "./routes/auth.routes.js";
import trainerRouter from "./routes/trainer.routes.js";

// --- Cấu hình ban đầu ---
dotenv.config();
const app = express();
const isDev = process.env.NODE_ENV !== "production";

console.log("Initializing middlewares...");

// --- MIDDLEWARES ---

// 1. CORS: Middleware quan trọng nhất, đặt lên đầu tiên.
// Cấu hình để chấp nhận tất cả mọi thứ để gỡ lỗi.
app.use(cors());
app.options("*", cors()); // Xử lý các pre-flight request

console.log("CORS middleware initialized.");

// 2. Logging (để thấy request đến)
// Chúng ta sẽ dùng 'dev' để log ngay lập tức
app.use(morgan("dev"));
console.log("Morgan logging middleware initialized.");

// 3. Body Parsers (Tăng giới hạn lên 10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
console.log("Body parser middleware initialized.");

// 4. Security
app.use(helmet());
console.log("Helmet middleware initialized.");

// 5. Cookies
app.use(cookieParser());
console.log("Cookie parser middleware initialized.");

// --- Rate Limiter ---
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests." },
});
console.log("Rate limiter initialized.");

// --- ROUTES ---
console.log("Initializing routes...");
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/trainer", trainerRouter); // Route cho AI Trainer

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.get("/", (_req, res) => {
  res.json({ message: "Chào mừng các tình yêu đã đến với web của anh" });
});
console.log("Routes initialized.");

// --- 404 HANDLER (đặt sau tất cả các routes) ---
app.use("*", (_req, res) => {
  console.log("404 Not Found triggered for request.");
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- GLOBAL ERROR HANDLER (đặt cuối cùng) ---
app.use((err, _req, res, _next) => {
  console.error("--- GLOBAL ERROR HANDLER CAUGHT AN ERROR ---");
  console.error(err); // Log lỗi đầy đủ ra console

  const status = err.status || 500;
  const safeMessage =
    status === 500 && !isDev ? "Internal server error" : err.message;

  res.status(status).json({
    success: false,
    message: safeMessage || "Internal server error",
    errors: Array.isArray(err.errors) ? err.errors : [],
    ...(isDev ? { stack: err.stack } : {}),
  });
});
console.log("Error handlers initialized. Application setup complete.");

export default app;
