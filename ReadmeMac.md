# Hướng dẫn chạy AITrainer trên Mac

## Lần đầu tiên (cài đặt)

```bash
cd AITrainer
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Chạy server

```bash
cd AITrainer
source .venv/bin/activate
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Server chạy tại: http://localhost:8000

## Kiểm tra hoạt động

Mở trình duyệt vào: http://localhost:8000/health

## Dừng server

Nhấn `Ctrl + C` trong Terminal
