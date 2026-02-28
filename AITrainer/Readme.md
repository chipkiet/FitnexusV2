# 🏋️‍♂️ AITrainer - Hướng dẫn Cài đặt & Chạy Server (Step-by-Step)

Tài liệu này hướng dẫn cách thiết lập môi trường và chạy server `AITrainer` cho cả **Windows** và **macOS**.

## 📌 Yêu cầu hệ thống (Prerequisites)
- **Python**: Phiên bản **3.9** trở lên (Khuyến nghị 3.9 - 3.11). Kiểm tra bằng lệnh: `python --version` hoặc `python3 --version`.
- Cần có tài khoản / API Key của Groq nếu API yêu cầu (kiểm tra trong file `.env` nếu có).

---

## 🚀 Bước 1: Mở Terminal và di chuyển vào thư mục cẩn thiết
Mở Terminal (macOS) hoặc Command Prompt / PowerShell (Windows) và chuyển hướng tới đúng thư mục `AITrainer`:
```bash
cd đường_dẫn_đến_project/FitnexusV2/AITrainer
```

---

## 🚀 Bước 2: Tạo môi trường ảo (Virtual Environment)
Môi trường ảo (venv) giúp cô lập các thư viện của dự án, tránh xung đột với các project khác.

Chạy lệnh sau để tạo môi trường ảo có tên là `venv`:
```bash
# Cho Windows và macOS (nếu dùng chung lệnh python)
python -m venv venv

# Hoặc nếu macOS/Linux của bạn mặc định gọi python3:
python3 -m venv venv
```

---

## 🚀 Bước 3: Kích hoạt môi trường ảo (Activate)

Tùy vào hệ điều hành, bạn hãy chạy lệnh tương ứng:

**🍎 Dành cho macOS (Mac):**
```bash
source venv/bin/activate
```

**🪟 Dành cho Windows:**
- Dùng **Command Prompt (cmd):**
  ```cmd
  venv\Scripts\activate.bat
  ```
- Dùng **PowerShell:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```

> **Dấu hiệu thành công:** Khi kích hoạt thành công, bạn sẽ thấy chữ `(venv)` hiển thị ở đầu dòng lệnh trong Terminal của bạn.

---

## 🚀 Bước 4: Cài đặt các thư viện yêu cầu (Dependencies)
**Lưu ý:** Chỉ thực hiện bước này KHI ĐÃ KÍCH HOẠT THÀNH CÔNG `(venv)`.

Cài đặt các gói phần mềm (bao gồm `fastapi`, `uvicorn`, `mediapipe==0.10.14`, `opencv-python`,...) bằng lệnh sau:
```bash
pip install -r requirements.txt
```
*(Hãy chờ một chút để hệ thống tải và cài đặt toàn bộ thư viện)*

---

## 🚀 Bước 5: Khởi động Server (AITrainer Service)
Sau khi cài xong, khởi động server FastAPI bằng lệnh:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

> **Thành công:** Khi thấy có dòng báo "Application startup complete", server AITrainer đã chạy tại địa chỉ API: `http://localhost:8000`

---

## 🚀 Bước 6: Khởi động App (Frontend/FitnexusApp)
Khi server AITrainer đã chạy, bạn MỞ MỘT CỬA SỔ TERMINAL MỚI (để không làm tắt server đang chạy) và Khởi động phần Frontend/App chính của dự án:

```bash
# Di chuyển vào thư mục app chính (ví dụ FitnexusApp / Frontend)
cd đường_dẫn_đến_project/FitnexusV2/FitnexusApp

# Cài đặt thư viện node (nếu chưa cài)
npm install

# Khởi chạy frontend
npm run dev
```

---
### 💡 Một số lệnh hữu ích bổ sung:
- **Tắt Server AITrainer:** Nhấn tổ hợp phím `Ctrl + C` tại cửa sổ Terminal đang chạy `uvicorn`.
- **Thoát venv:** Sau khi làm việc xong, nếu muốn thoát môi trường ảo, gõ lệnh: `deactivate`.
