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

Lưu ý Apple Silicon (M1/M2/M3)
- Nếu gặp lỗi khi cài `opencv-python`, thử thay thế: `pip install opencv-python-headless`
- Nếu vẫn lỗi, đảm bảo đang dùng Python 3.10/3.11 (có sẵn wheel cho arm64) và đã cập nhật `pip` như trên.

2) Cấu hình Gemini API Key
Hiện tại file `AITrainer/api.py` đang đọc khóa trực tiếp từ biến hằng `GEMINI_API_KEY`.
- Cách nhanh nhất (không khuyến nghị khi commit): mở `AITrainer/api.py` và thay giá trị `GEMINI_API_KEY = "..."` bằng khóa của bạn.
- Cách an toàn (khuyến nghị): dùng `.env` + `config.py` (đã có sẵn):
  - Tạo file `AITrainer/.env` với nội dung: `GEMINI_API_KEY=YOUR_KEY_HERE`
  - Chỉnh `api.py` để lấy khóa từ `config.API_KEY` thay vì hằng chuỗi cứng. Nếu bạn chưa muốn sửa mã ngay, dùng cách nhanh ở trên cho mục đích local.

Mẹo: có thể đặt model qua biến môi trường `GEMINI_MODEL` (mặc định: `gemini-2.5-flash-lite`).

3) Khởi động dịch vụ AI (FastAPI)
- Trong thư mục `AITrainer` (đang bật venv):
  - Cách 1 (gợi ý khi dev): `uvicorn api:app --reload --host 0.0.0.0 --port 8000`
  - Cách 2: `python3 api.py`

Nếu chạy thành công, log sẽ báo đã tải YOLO và lắng nghe ở cổng 8000.
Ảnh đã xử lý sẽ lưu trong `AITrainer/processed_images` và truy cập qua URL `/processed/...`.

4) Kiểm tra nhanh bằng cURL
Thử gọi API phân tích ảnh:
```
curl -X POST \
  -F "file=@/đường-dẫn-tới/anh.jpg" \
  http://127.0.0.1:8000/analyze-image/
```
Kết quả trả về là JSON gồm `analysis_data` và `processed_image_url`.

5) Kết nối với ứng dụng Fitnexus
- Backend (packages/backend) mặc định trỏ tới AI qua biến `AI_API_URL`:
  - Giá trị mặc định: `http://127.0.0.1:8000/analyze-image/` (xem `packages/backend/routes/trainer.routes.js`).
  - Có thể cấu hình trong `packages/backend/.env` với khóa `AI_API_URL`.
- Chạy toàn bộ app (tại thư mục gốc `FitnexusApp`):
  - Cần Node.js 18+.
  - Cài deps: `npm install`
  - Chạy đồng thời backend + frontend: `npm run dev`

Thứ tự đề xuất
1) Chạy AI trước ở cổng 8000
2) Sau đó chạy `npm run dev` ở thư mục gốc để backend/ frontend gọi được dịch vụ AI

6) Sự cố thường gặp
- Import lỗi `cv2` (opencv): thử `pip install opencv-python-headless` hoặc hạ Python xuống 3.11/3.10.
- Lỗi timeout gọi Gemini: kiểm tra internet và khóa hợp lệ, thử đặt `GEMINI_MODEL` khác.
- Ảnh không hiển thị keypoints: thử ảnh rõ người, toàn thân; YOLO dùng `yolov8n-pose.pt` đã có sẵn trong `AITrainer/`.
- 403/401 từ Gemini: kiểm tra quota và quyền API key.

Bảo mật
- Không commit API key. Dùng `.env` (local) và nạp qua `config.py` khi có thể.

Gỡ lỗi nhanh
- In log chi tiết trong Terminal khi chạy `uvicorn` với `--reload`.
- Kiểm tra API AI: `http://127.0.0.1:8000/analyze-image/` bằng cURL như trên.
- Kiểm tra backend đã trỏ đúng `AI_API_URL` nếu gọi từ app.

