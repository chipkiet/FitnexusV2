import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";
import { CodeIndexer } from "./codeIndexer.js";
import { initModels } from "../models/initModels.js";
import { sequelize } from "../config/database.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiAppSingleton = null;
let aiServer = null;
let indexer = null;
let genAI = null;


function getAllowedOrigins() {
  const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
  const add = (process.env.ADDITIONAL_CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [FRONTEND, ...add];
}

function getProjectRoot() {
  // packages/backend/ai -> projectRoot = repoRoot
  return path.resolve(__dirname, "../../..");
}

function describeModels() {
  try {
    // Ensure models initialized
    initModels?.();
    const models = sequelize.models || {};
    const lines = [];
    for (const [name, model] of Object.entries(models)) {
      const attrs = model.rawAttributes || {};
      const cols = Object.keys(attrs).map((k) => {
        const type =
          attrs[k]?.type?.constructor?.name || attrs[k]?.type || "unknown";
        return `${k}: ${type}`;
      });
      lines.push(`Model ${name}:\n  Fields: ${cols.join(", ")}`);
    }
    return lines.join("\n\n");
  } catch (e) {
    console.error("[AI] Error describing models:", e);
    return "";
  }
}

function describeProject() {
  return `
Dự án Fitnexus - Hệ thống quản lý phòng gym:

KIẾN TRÚC BACKEND:
- Framework: Express.js với ES6 modules
- Database: PostgreSQL với Sequelize ORM
- Authentication: JWT tokens
- File upload: Multer
- Payment: VNPay integration
- Real-time: Socket.io
- Cron jobs: node-cron cho subscription expiry

CÁC CHỨC NĂNG CHÍNH:
1. Quản lý người dùng (User Management)
   - Đăng ký, đăng nhập, xác thực JWT
   - Phân quyền: admin, trainer, member
   - Profile management với avatar upload

2. Quản lý gói tập (Subscription/Membership)
   - Các gói tập khác nhau (monthly, quarterly, yearly)
   - Thanh toán qua PayOS
   - Tự động kiểm tra hết hạn

3.

4.

5.

6. Thông báo (Notifications)
   - Real-time notifications qua Socket.io
   - Email notifications
   - Push notifications

KIẾN TRÚC FRONTEND:
- Framework: React với Vite
- Routing: React Router
- State management: Context API / useState
- Styling: Tailwind CSS
- Icons: Lucide React
- API calls: Axios

CẤU TRÚC THƯ MỤC:
/packages/backend/
  /config - Database, authentication config
  /models - Sequelize models
  /routes - API routes
  /controllers - Business logic
  /middleware - Auth, validation, error handling
  /services - External services (payment, email)
  /ai - AI chatbot service

/packages/frontend/
  /src/components - React components
  /src/pages - Page components
  /src/lib - Utilities, API client
  /src/context - React contexts
`;
}

export function createAiExpressApp() {
  if (aiAppSingleton) return aiAppSingleton;
  const app = express();

  app.use(express.json({ limit: "200kb" }));
  app.use(express.urlencoded({ extended: true, limit: "200kb" }));
  app.use(helmet());
  app.use(cors({ origin: getAllowedOrigins(), credentials: true }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("[AI] Gemini API initialized");
    } catch (e) {
      console.error("[AI] Failed to initialize Gemini:", e);
    }
  } else {
    console.warn("[AI] GEMINI_API_KEY not set - AI will run in limited mode");
  }

  // Build code index on first init
  if (!indexer) {
    const projectRoot = getProjectRoot();
    indexer = new CodeIndexer({ rootDir: projectRoot });
    setImmediate(() => {
      try {
        indexer.build();
        console.log(`[AI] Indexed codebase: ${indexer.chunks.length} chunks`);
      } catch (e) {
        console.error("[AI] Index build error:", e);
      }
    });
  }

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      service: "ai",
      status: "ok",
      hostname: os.hostname(),
      gemini: !!genAI,
      index: indexer ? indexer.getStatus() : { ready: false },
    });
  });

  app.post("/chat", async (req, res) => {
    const { message = "", history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const top = indexer?.search(message, 8) || [];
    const contextBlocks = top.map((ch) => ch.text.substring(0, 800));

    const dbDesc = describeModels();

    const systemPrompt = `
      Bạn là trợ lý AI dành cho NGƯỜI DÙNG cuối của ứng dụng Fitnexus (app hỗ trợ tập luyện, dinh dưỡng, sức khỏe).

      Mục tiêu:
      - Giải thích đơn giản, dễ hiểu các chức năng trong app (AI Trainer, Nutrition, Workout plan, Profile, Subscription, v.v.).
      - Trả lời như đang tư vấn cho một người dùng bình thường, không có kiến thức lập trình.

      Quy tắc:
      - KHÔNG được nhắc đến mã nguồn, tên file, đường dẫn thư mục, bảng database, tên framework, thư viện, hay cấu trúc thư mục (ví dụ: "packages/frontend/src/...", "nutrition.routes.js", "Sequelize model", v.v.).
      - Chỉ dùng thông tin từ mã nguồn & database như một tài liệu nội bộ để hiểu hệ thống, nhưng không lộ chi tiết kỹ thuật ra câu trả lời.
      - Ưu tiên trả lời ngắn gọn, rõ ràng, tập trung vào:
        + Tính năng này dùng để làm gì?
        + Người dùng thao tác như thế nào?
        + Lợi ích / giá trị với người dùng là gì?
      - Nếu thiếu thông tin, hãy nói thẳng là "Mình không thấy thông tin chi tiết trong hệ thống", sau đó giải thích ở mức tổng quát, không bịa chi tiết.

      Ngôn ngữ:
      - Trả lời bằng tiếng Việt.
      - Giọng điệu thân thiện, tôn trọng, chuyên nghiệp, không dùng thuật ngữ kỹ thuật trừ khi thật sự cần.
      `;
    
    const userPrompt = `Câu hỏi: ${message}\n\nBối cảnh mã (top matches):\n${contextBlocks.join("\n\n")}\n\nMô hình dữ liệu (Sequelize Models):\n${dbDesc || "(Không lấy được mô hình dữ liệu)"}`;

    try {
      if (genAI) {
        // Lazy import to avoid requiring if not installed in some envs

        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        });

        const chatHistory = history.slice(-6).map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));

        const userPromptWithContext = `${message}
        BỐI CẢNH MÃ NGUỒN LIÊN QUAN:
        ${contextBlocks.join("\n\n")}`;

        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "Được rồi, mình đã hiểu. Mình là trợ lý AI cho dự án Fitnexus và sẵn sàng giúp bạn!",
                },
              ],
            },
            ...chatHistory,
          ],
        });

        const result = await chat.sendMessage(userPromptWithContext);

        const reply =
          result.response.text() || "Xin lỗi, mình không thể tạo phản hồi.";
        return res.json({ success: true, data: { reply } });
      }
      // Fallback: return a heuristic answer with matched files
      const reply = top.length
        ? ` Chưa cấu hình GEMINI_API_KEY nên mình chỉ có thể tìm các file liên quan:

        ${top.map((c, i) => `${i + 1}.  ${c.path}`).join("\n")}

         Để bật AI đầy đủ, hãy:
        1. Lấy API key tại: https://makersuite.google.com/app/apikey
        2. Thêm vào file .env: GEMINI_API_KEY=your_key_here
        3. (Optional) GEMINI_MODEL=gemini-1.5-flash`
        : ` Chưa cấu hình GEMINI_API_KEY và không tìm thấy code liên quan.

        Hãy đặt biến môi trường GEMINI_API_KEY để có trải nghiệm AI đầy đủ.`;

      return res.json({ success: true, data: { reply } });
    } catch (err) {
      console.error("[AI] chat error:", err);
      return res.status(500).json({
        success: false,
        message: "AI chat error",
        error: String(err?.message || err),
      });
    }
  });

  aiAppSingleton = app;
  return app;
}

export function ensureAiApp() {
  return createAiExpressApp();
}

export function startAiServer() {
  const app = ensureAiApp();
  if (aiServer) return aiServer;
  const aiPort = parseInt(process.env.AI_PORT || "3002", 10);
  aiServer = http.createServer(app);
  aiServer.listen(aiPort, () => {
    // eslint-disable-next-line no-console
    console.log(`AI server is running on http://localhost:${aiPort}`);
  });
  aiServer.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[AI] server error:", err);
  });
  return aiServer;
}
