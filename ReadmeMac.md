
- Tạo môi trường ảo: `python3 -m venv .venv`
- Kích hoạt môi trường ảo: `source .venv/bin/activate`
- Cập nhật công cụ build: `pip install --upgrade pip setuptools wheel`
- Cài thư viện: `pip install -r requirements.txt`


Run: `uvicorn api:app --reload --host 0.0.0.0 --port 8000`

