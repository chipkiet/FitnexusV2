# Hướng dẫn chạy AITrainer trên Mac

## Lần đầu tiên (cài đặt)

```bash
cd AITrainer
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Download model AI (bắt buộc, chỉ làm 1 lần)

```bash
curl -L -o pose_landmarker_heavy.task \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task
```

> File ~30MB, lưu trong thư mục `AITrainer/` (không commit lên git)

## Tạo file .env

```bash
cp .env.example .env
# Mở .env và điền GROQ_API_KEY (lấy miễn phí tại https://console.groq.com/keys)
```

## Chạy server

```bash
cd AITrainer
source .venv/bin/activate
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Server chạy tại: http://localhost:8000

## Kiểm tra hoạt động

```bash
curl http://localhost:8000/health
# Kết quả: {"pose_model":"loaded","groq_api":"configured","processed_images_dir":true}
```

## Dừng server

Nhấn `Ctrl + C` trong Terminal
