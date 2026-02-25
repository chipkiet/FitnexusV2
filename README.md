# FitnexusV2

Dự án Fitnexus là một ứng dụng web về thể hình, tích hợp AI để phân tích tư thế người dùng từ ảnh, sau đó đưa ra các đánh giá vóc dáng và gợi ý lộ trình tập luyện phù hợp. 

Dự án được tổ chức theo cấu trúc monorepo bao gồm:
- **Frontend** (`packages/frontend`): React + Vite + TailwindCSS.
- **Backend** (`packages/backend`): Node.js + Express + Sequelize (PostgreSQL) + Redis.
- **AI Trainer** (`AITrainer`): Python + FastAPI + YOLOv8 + Google Gemini AI.

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Dự Án

### CÁCH 1: Chạy bằng Docker (Khuyên dùng)
Đây là cách đơn giản nhất để khởi động toàn bộ các dịch vụ (Database, Cache, Backend, Frontend, AI Trainer) cùng lúc mà không cần cài đặt nhiều phụ thuộc.

1. **Chuẩn bị file biến môi trường:**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```
   *Mở file `.env` vừa tạo và điền các thông tin phù hợp (nếu cần).*

2. **Khởi chạy toàn bộ dịch vụ:**
   ```bash
   cd docker
   docker compose up --build
   ```

3. **Truy cập:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend (API): [http://localhost:3001](http://localhost:3001)
   - AI Trainer (FastAPI): [http://localhost:8000](http://localhost:8000)

4. **Các lệnh Docker hữu ích:**
   - Dừng các dịch vụ: `docker compose down`
   - Xem log backend: `docker compose logs -f backend`
   - Chạy lệnh DB Migrate: `docker compose run --rm backend npm run db:migrate`

---

### CÁCH 2: Chạy Local từng dịch vụ (Dành cho Development)

Yêu cầu hệ thống:
- Node.js (v18 trở lên)
- Python (3.8 trở lên)
- PostgreSQL & Redis (đang chạy ở local)

#### 1. Cài đặt dependency chung
Tại thư mục gốc của dự án (FitnexusV2), bạy chạy lệnh sau để cài đặt packets cho cả frontend và backend:
```bash
npm install
```

#### 2. Khởi chạy AI Trainer (Bắt buộc để tính năng nhận diện hđộng)
Dịch vụ này sử dụng Python để nhận diện tư thế và API Gemini.
```bash
cd AITrainer

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường (Windows)
.\venv\Scripts\activate
# (Hoặc trên Mac/Linux: source venv/bin/activate)

# Cài đặt thư viện
pip install -r requirements.txt
```
**Lưu ý:** Bạn cần mở file `AITrainer/api.py`, tìm biến `GEMINI_API_KEY` và thay thế bằng API key thật của bạn.

Khởi động AI server:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

#### 3. Khởi chạy Frontend & Backend
Tại thư mục gốc (FitnexusV2), mở một terminal mới:
```bash
npm run dev
```
Lệnh này sẽ tự động gọi các script đồng bộ và khởi chạy cả Backend (cổng 3001) lẫn Frontend (cổng 5173).

*(Bạn cũng có thể config file `packages/backend/.env` bằng database credentials cục bộ của bạn và chạy `cd packages/backend && npm run db:migrate` trước khi start server nếu database trống).*

---

## 🤖 Tính Năng AI Trainer (Python YOLOv8 + Gemini)
Hệ thống AI Trainer cung cấp API tự động phân tích người:
1. Bạn gửi ảnh (Upload File) lên endpoint `/analyze-image/`.
2. Model **YOLOv8** (yolov8n-pose.pt) được sử dụng để trích xuất các khớp trên cơ thể (Vai, hông, điểm ngực, ...).
3. Hệ thống tính toán các số đo cơ thể thông qua px hoặc chiều cao thực tế cung cấp `known_height_cm`.
4. Bot nội bộ tự động đưa các số đo vào prompt gửi cho **Google Gemini AI**.
5. AI đưa ra đánh giá tạng người (Dáng chữ V, H...), gợi ý bài tập gym và cung cấp lời khuyên dinh dưỡng chuẩn JSON về cho backend.