Hướng dẫn chạy AI Trainer trên macOS (Apple Silicon & Intel)

Mục tiêu: khởi động dịch vụ AI Python (FastAPI + YOLO + Gemini) trong thư mục `AITrainer` trên macOS và kết nối với app Fitnexus.

Yêu cầu hệ thống
- macOS 12+ (Monterey) hoặc mới hơn
- Python 3.10 hoặc 3.11 (khuyên dùng). Tránh 3.12 nếu `opencv-python` gặp lỗi build.
- Xcode Command Line Tools: `xcode-select --install` (chỉ cần nếu chưa cài)
- (Tùy chọn) Homebrew: https://brew.sh

1) Chuẩn bị môi trường Python
- Mở Terminal và chuyển vào thư mục dự án: `cd /đường-dẫn-tới/FitnexusApp/AITrainer`
- Tạo môi trường ảo: `python3 -m venv .venv`
- Kích hoạt môi trường ảo: `source .venv/bin/activate`
- Cập nhật công cụ build: `pip install --upgrade pip setuptools wheel`
- Cài thư viện: `pip install -r requirements.txt`


3) Khởi động dịch vụ AI (FastAPI)
- Trong thư mục `AITrainer` (đang bật venv):
  - Cách 1 (gợi ý khi dev): `uvicorn api:app --reload --host 0.0.0.0 --port 8000`
  - Cách 2: `python3 api.py`

Nếu chạy thành công, log sẽ báo đã tải YOLO và lắng nghe ở cổng 8000.
Ảnh đã xử lý sẽ lưu trong `AITrainer/processed_images` và truy cập qua URL `/processed/...`.


5) Kết nối với ứng dụng Fitnexus
- Backend (packages/backend) mặc định trỏ tới AI qua biến `AI_API_URL`:
  - Giá trị mặc định: `http://127.0.0.1:8000/analyze-image/` (xem `packages/backend/routes/trainer.routes.js`).
  - Có thể cấu hình trong `packages/backend/.env` với khóa `AI_API_URL`.
- Chạy toàn bộ app (tại thư mục gốc `FitnexusApp`):
  - Cần Node.js 18+.
  - Cài deps: `npm install`
  - Chạy đồng thời backend + frontend: `npm run dev`
