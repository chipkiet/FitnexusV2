import cv2
import math
import os
import json
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import google.generativeai as genai
import uvicorn
import shutil

# Thêm thư viện FastAPI
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# --- KHỞI TẠO APP FASTAPI ---
app = FastAPI(title="Fitnexus AI Trainer API")

# --- Cấu hình CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CẤU HÌNH VÀ KHỞI TẠO MODEL (Thực hiện một lần khi server khởi động) ---

# !!! QUAN TRỌNG: Dán khóa API hợp lệ của bạn vào đây !!!
GEMINI_API_KEY = "AIzaSyCBHEa4eJfTwEMCoJkKr8POz4_lNwomPrU" 

if not GEMINI_API_KEY or GEMINI_API_KEY == "DÁN_KHÓA_API_HỢP_LỆ_CỦA_BẠN_VÀO_ĐÂY":
    print("LỖI: Bạn chưa cấu hình khóa API cho Gemini trong file api.py.")
    sys.exit(1)
genai.configure(api_key=GEMINI_API_KEY)
print("Khởi tạo cấu hình Gemini API...")
# Chuẩn bị danh sách model fallback để tương thích nhiều phiên bản API
GEMINI_MODELS = [
    os.getenv("GEMINI_MODEL") or "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
]

def _gemini_generate_json(prompt: str, timeout_sec: int = 120):
    last_err = None
    for model_name in GEMINI_MODELS:
        try:
            print(f"[Gemini] Trying model: {model_name}")
            model = genai.GenerativeModel(model_name)
            resp = model.generate_content(prompt, request_options={'timeout': timeout_sec})
            return resp
        except Exception as e:
            # Lưu lỗi và thử model tiếp theo (đặc biệt fix lỗi v1beta 404)
            print(f"[Gemini] model {model_name} failed: {e}")
            last_err = e
            continue
    # Không model nào chạy được => ném lỗi cuối cùng
    raise last_err if last_err else RuntimeError("Gemini API call failed for all models")

yolo_model = YOLO('yolov8n-pose.pt')
print("Đã tải YOLOv8 model.")

# Font không còn được dùng để vẽ lên ảnh, nhưng có thể để lại nếu cần sau này
FONT_PATH = "arial.ttf"
if not os.path.exists(FONT_PATH):
    print(f"CẢNH BÁO: Không tìm thấy tệp font '{FONT_PATH}'.")

KEYPOINT_MAPPING = {"left_shoulder": 5, "right_shoulder": 6, "left_hip": 11, "right_hip": 12}

os.makedirs("processed_images", exist_ok=True)
app.mount("/processed", StaticFiles(directory="processed_images"), name="processed")

# --- CÁC HÀM XỬ LÝ ---

def calculate_distance(p1, p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

def get_gemini_recommendations(shoulder_to_waist_ratio):
    print(f"\nĐang gọi Gemini API với tỉ lệ {shoulder_to_waist_ratio:.2f}...")
    prompt = f"""
    Dựa trên tỉ lệ vai/eo của một người là {shoulder_to_waist_ratio:.2f}, hãy đề xuất 3-5 bài tập gym kèm giải thích ngắn gọn bằng tiếng Việt để giúp cải thiện vóc dáng cân đối hơn. Đồng thời, hãy đưa ra một lời khuyên chung về thể hình.

    Vui lòng định dạng câu trả lời của bạn dưới dạng một đối tượng JSON hợp lệ với cấu trúc sau:
    {{
        "title": "Một tiêu đề ngắn gọn cho các đề xuất",
        "exercises": [
            "Tên bài tập 1: Mô tả ngắn gọn",
            "Tên bài tập 2: Mô tả ngắn gọn"
        ],
        "advice": "Lời khuyên chung về tập luyện"
    }}
    Chỉ trả về đối tượng JSON, không có bất kỳ văn bản nào khác.
    """
    try:
        response = _gemini_generate_json(prompt, timeout_sec=120)
        text_response = getattr(response, 'text', None) or ''
        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        if json_start != -1 and json_end != -1 and json_start < json_end:
            json_str = text_response[json_start:json_end]
            return json.loads(json_str)
        else:
            raise ValueError(f"Gemini không trả về JSON hợp lệ: {text_response}")
    except Exception as e:
        print(f"Lỗi khi gọi Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi Gemini API: {e}")

# --- TẠO ENDPOINT API (ĐÃ CẬP NHẬT) ---

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Không thể đọc file ảnh.")
    
    # 1. Chạy model YOLO để lấy kết quả
    results = yolo_model(image, verbose=False, conf=0.5)
    
    # 2. Khởi tạo dữ liệu trả về mặc định
    recommendations = {
        "title": "Không phát hiện được cơ thể", 
        "exercises": [], 
        "advice": "Vui lòng thử lại với một ảnh khác rõ ràng hơn.",
        "ratio": 0.0 # Thêm trường tỉ lệ
    }
    
    # 3. Vẽ tất cả kết quả nhận diện gốc của YOLO (khung, nhãn, bộ xương)
    # Dòng này sẽ vẽ các chi tiết bạn muốn giữ lại
    image_to_save = results[0].plot(img=image) 
    
    # 4. Phân tích và gọi Gemini (KHÔNG VẼ GÌ THÊM LÊN ẢNH)
    if results[0].keypoints and results[0].keypoints.xy.numel() > 0:
        kpts = results[0].keypoints.xy[0].cpu().numpy()
        
        # Kiểm tra xem các điểm khớp cần thiết có được phát hiện không
        if all(p[0] > 0 and p[1] > 0 for p in [kpts[5], kpts[6], kpts[11], kpts[12]]):
            shoulder_width = calculate_distance(kpts[5], kpts[6])
            waist_width = calculate_distance(kpts[11], kpts[12])
            
            if waist_width > 0:
                ratio = shoulder_width / waist_width
                # Lấy gợi ý từ Gemini
                recommendations = get_gemini_recommendations(ratio) 
                # Lưu lại tỉ lệ đã tính được vào dữ liệu JSON
                recommendations['ratio'] = round(ratio, 2)

    # 5. Lưu ảnh đã được vẽ bởi YOLO (không có text tự thêm)
    output_filename = f"processed_{file.filename}"
    output_path = os.path.join("processed_images", output_filename)
    cv2.imwrite(output_path, image_to_save)
    
    image_url = f"http://localhost:8000/processed/{output_filename}"

    # 6. Trả về kết quả JSON (chứa tất cả thông tin text) và URL của ảnh đã xử lý
    return {
        "analysis_data": recommendations,
        "processed_image_url": image_url
    }

# Lệnh để chạy server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
