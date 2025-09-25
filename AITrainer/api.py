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
from fastapi.middleware.cors import CORSMiddleware # Thêm CORS

# --- KHỞI TẠO APP FASTAPI ---
app = FastAPI(title="Fitnexus AI Trainer API")

# --- Cấu hình CORS ---
# Cho phép tất cả các nguồn gốc (không an toàn cho production, nhưng tốt cho local dev)
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
gemini_model = genai.GenerativeModel('gemini-1.5-flash')
print("Đã kết nối Gemini API.")

yolo_model = YOLO('yolov8n-pose.pt')
print("Đã tải YOLOv8 model.")

FONT_PATH = "arial.ttf"
if not os.path.exists(FONT_PATH):
    print(f"LỖI: Không tìm thấy tệp font '{FONT_PATH}'. Hãy sao chép arial.ttf vào thư mục này.")
    sys.exit(1)

KEYPOINT_MAPPING = {"left_shoulder": 5, "right_shoulder": 6, "left_hip": 11, "right_hip": 12}

os.makedirs("processed_images", exist_ok=True)
app.mount("/processed", StaticFiles(directory="processed_images"), name="processed")


# --- CÁC HÀM XỬ LÝ (Giữ nguyên từ code trước) ---

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
        response = gemini_model.generate_content(prompt, request_options={'timeout': 120})
        text_response = response.text
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

def draw_text_with_pillow(image, text, position, font_size, text_color):
    pil_img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img, 'RGBA')
    try:
        font = ImageFont.truetype(FONT_PATH, font_size)
    except IOError:
        font = ImageFont.load_default()
    text_bbox = draw.textbbox(position, text, font=font)
    bg_position = (text_bbox[0] - 5, text_bbox[1] - 5, text_bbox[2] + 5, text_bbox[3] + 5)
    draw.rectangle(bg_position, fill=(0, 0, 0, 128))
    draw.text(position, text, font=font, fill=text_color)
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

# --- TẠO ENDPOINT API ---

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Không thể đọc file ảnh.")
    
    results = yolo_model(image, verbose=False, conf=0.5)
    recommendations = {"title": "Không phát hiện được cơ thể", "exercises": [], "advice": "Vui lòng thử lại với một ảnh khác rõ ràng hơn."}
    image = results[0].plot(img=image) # Vẽ các điểm khớp lên ảnh
    
    if results[0].keypoints and results[0].keypoints.xy.numel() > 0:
        kpts = results[0].keypoints.xy[0].cpu().numpy()
        
        # Check if keypoints are detected with confidence
        if all(p[0] > 0 and p[1] > 0 for p in [kpts[5], kpts[6], kpts[11], kpts[12]]):
            shoulder_width = calculate_distance(kpts[5], kpts[6])
            waist_width = calculate_distance(kpts[11], kpts[12])
            
            if waist_width > 0:
                ratio = shoulder_width / waist_width
                recommendations = get_gemini_recommendations(ratio)
                ratio_text = f'Tỉ lệ Vai/Eo: {ratio:.2f}'
                image = draw_text_with_pillow(image, ratio_text, (50, 50), 30, (51, 153, 255))
    
    image = draw_text_with_pillow(image, recommendations['title'], (50, 100), 24, (0, 0, 255))
    y_pos = 150
    for exercise in recommendations['exercises']:
        image = draw_text_with_pillow(image, f"- {exercise}", (50, y_pos), 20, (0, 255, 0))
        y_pos += 40
    image = draw_text_with_pillow(image, "Lời khuyên: " + recommendations['advice'], (50, y_pos + 20), 20, (255, 255, 0))

    output_filename = f"processed_{file.filename}"
    output_path = os.path.join("processed_images", output_filename)
    cv2.imwrite(output_path, image)
    
    image_url = f"http://localhost:8000/processed/{output_filename}"

    return {
        "analysis_data": recommendations,
        "processed_image_url": image_url
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)