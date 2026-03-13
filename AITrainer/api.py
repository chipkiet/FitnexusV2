import cv2
import math
import os
import json
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import groq
import uvicorn
import shutil

# Thêm thư viện FastAPI
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Import module pose_analyzer
from core.pose_analyzer import (
    load_pose_model,
    analyze_pose_with_model,
    draw_measurements_on_image,
)

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

from dotenv import load_dotenv

load_dotenv(override=True)

# !!! QUAN TRỌNG: Lấy khóa API GROQ miễn phí tại https://console.groq.com/keys
# Xóa placeholder và dán khóa thật của bạn vào đây (bắt đầu bằng gsk_) !!!
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "PASTE GROQ API KEY HERE"

if not GROQ_API_KEY or GROQ_API_KEY == "gsk_VUI_LONG_THAY_KHOA_CUA_BAN":
    print("LỖI: Bạn chưa cấu hình khóa API cho GROQ trong file api.py (hoặc .env).")
    print("Truy cập https://console.groq.com/keys để lấy một API key miễn phí!")
    sys.exit(1)

groq_client = groq.Groq(api_key=GROQ_API_KEY)
print("Khởi tạo cấu hình Groq API (Llama models)...")

# Chuẩn bị danh sách model fallback trên Groq
GROQ_MODELS = [
    os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-groq-8b-8192-tool-use-preview",
]


def _groq_generate_json(prompt: str, timeout_sec: int = 120):
    last_err = None
    for model_name in GROQ_MODELS:
        try:
            print(f"[Groq] Trying model: {model_name}")
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model_name,
                response_format={"type": "json_object"},
                timeout=timeout_sec,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"[Groq] model {model_name} failed: {e}")
            last_err = e
            continue
    raise last_err if last_err else RuntimeError("Groq API call failed for all models")


# Khởi tạo MediaPipe Pose Model
pose_model = load_pose_model()
if pose_model is None:
    print("LỖI: Không thể tải MediaPipe Pose model.")
    sys.exit(1)

FONT_PATH = "arial.ttf"
if not os.path.exists(FONT_PATH):
    print(f"CẢNH BÁO: Không tìm thấy tệp font '{FONT_PATH}'.")

os.makedirs("processed_images", exist_ok=True)
app.mount("/processed", StaticFiles(directory="processed_images"), name="processed")

# --- CÁC HÀM XỬ LÝ ---


def get_ai_recommendations(measurements_data):
    """
    Gọi Groq API (Llama) với dữ liệu đo lường chi tiết.

    Args:
        measurements_data: Dictionary chứa các số đo từ pose_analyzer
    """
    # Lấy số đo (ưu tiên cm, không có thì dùng px)
    if measurements_data.get("cm_measurements"):
        measurements = measurements_data["cm_measurements"]
        unit = "cm"
    else:
        measurements = measurements_data.get("pixel_measurements", {})
        unit = "px"

    # Tạo prompt chi tiết
    prompt = f"""
    Phân tích vóc dáng cơ thể dựa trên các số đo sau:
    
    **Số đo cơ bản:**
    - Chiều rộng vai: {measurements.get("shoulder_width", "N/A")} {unit}
    - Chiều rộng eo: {measurements.get("waist_width", "N/A")} {unit}
    - Chiều rộng hông: {measurements.get("hip_width", "N/A")} {unit}
    - Chiều cao: {measurements.get("height", "N/A")} {unit}
      **DANH SÁCH BÀI TẬP CÓ SẴN (BẮT BUỘC CHỌN TRONG DANH SÁCH NÀY):**
    - Ngực: 1. Đẩy Ngực Ngang Thanh Đòn (Barbell Bench Press), 2. Đẩy Ngực Ngang Tạ Tay (Dumbbell Bench Press), 3. Hít Đất (Push Up), 94. Đẩy Ngực Dốc Lên Thanh Đòn (Incline Barbell Bench Press), 97. Ép Ngực Với Cáp (Cable Pec Fly), 134. Đẩy Ngực Dốc Xuống Thanh Đòn (Barbell Decline Bench Press), 178. Đẩy Ngực Dốc Lên Với Tạ Tay (Dumbbell Incline Bench Press), 179. Ép Ngực Với Máy (Pec Deck) (Machine Pec Fly), 180. Nằm Dang Tạ Tay Tập Ngực (Dumbbell Fly), 181. Xà Kép Tập Ngực (Chest Dips), 416. Hít Đất Chân Cao (Decline Push-ups), 417. Ép Cáp Từ Cao Đến Thấp (High-to-Low Cable Fly).
    - Lưng/Xô: 40. Hít Xà Đơn (Pull Ups), 41. Kéo Xô Máy (Machine Pulldown), 95. Chèo Tạ Đòn Cúi Người (Barbell Bent Over Row), 175. Kéo Cáp Một Tay Tập Xô (Lat Prayer) (Cable Single Arm Lat Prayer), 177. Hít Xà Ngược (Inverted Row), 201. Kéo Cáp Ngồi (Seated Cable Row), 202. Nằm Vớt Tạ (Dumbbell Pullover), 270. Siêu Nhân (Superman).
    - Vai: 42. Đẩy Tạ Đòn Qua Đầu (Barbell Overhead Press), 43. Dang Tạ Tay Sang Bên (Dumbbell Lateral Raise), 98. Nâng Tạ Đơn Trước Mặt (Dumbbell Front Raise), 102. Kéo Cáp Cho Vai Sau (Machine Face Pulls), 171. Đẩy Tạ Đơn Qua Đầu Khi Ngồi (Dumbbell Seated Overhead Press), 172. Dang Một Tay Với Cáp Thấp (Cable Low Single Arm Lateral Raise), 173. Hít Đất Pike Chân Trên Cao (Elevated Pike Press), 174. Ép Tạ Đơn Vai Sau Khi Ngồi (Dumbbell Seated Rear Delt Fly), 190. Kéo Tạ Đòn Thẳng Đứng (Barbell Upright Row), 415. Dang Tạ Tay Ngược (Reverse Fly) (Dumbbell Reverse Fly).
    - Chân/Mông: 16. Squat Với Tạ Đòn (Barbell Squat), 21. Romanian Deadlift Với Tạ Đòn (Barbell Romanian Deadlift), 39. Hip Thrust Với Tạ Đòn (Barbell Hip Thrust), 96. Deadlift Với Tạ Đòn (Barbell Deadlift), 99. Đạp Đùi Với Máy (Machine Leg Press), 100. Đá Đùi Với Máy (Machine Leg Extension), 133. Cuốn Chân Nằm Với Máy (Machine Lying Leg Curl), 135. Lunge Bước Đi (Bodyweight Walking Lunges), 176. Kéo Cáp Qua Chân (Pull Through) (Cable Pull Through), 199. Vung Tạ Ấm (Kettlebell Swing), 200. Squat Với Tạ Tay (Goblet Squat) (Dumbbell Goblet Squat), 271. Cầu Mông (Glute Bridge) (Bodyweight Glute Bridge), 272. Đá Chân Sang Bên (Fire Hydrant).
    - Tay: 64. Cuốn Tạ Đòn (Barbell Curl), 65. Cuốn Tạ Đơn (Dumbbell Curl), 66. Đẩy Tạ Đơn Sau Đầu (Dumbbell Seated Overhead Tricep Extension), 67. Đẩy Cáp Tay Sau V-Bar (Machine Cable V Bar Push Downs), 70. Cuốn Cổ Tay Tạ Đơn (Dumbbell Wrist Curl), 71. Cuốn Cổ Tay Tạ Đòn (Barbell Wrist Curl), 182. Cuốn Tạ Tay Kiểu Búa (Hammer Curl) (Dumbbell Hammer Curl), 183. Chống Đẩy Sau Với Ghế (Bench Dips), 184. Đá Tạ Tay Sau (Dumbbell Kickback), 185. Cuốn Tạ Tập Trung (Concentration Curl), 191. Cuốn Cổ Tay Tạ Đòn Sau Lưng (Barbell Behind The Back Wrist Curl), 192. Nằm Đẩy Tạ Đòn Sau Đầu (Skull Crusher) (Barbell Skull Crusher), 197. Cuốn Tay Trước Với Cáp (Cable Bicep Curl), 198. Chống Xà Kép Tập Tay Sau (Tricep Dips).
    - Bụng/Core: 68. Gập Bụng (Crunches), 69. Plank Với Bóng (Medicine Ball Plank), 101. Vặn Người Kiểu Nga (Bodyweight Russian Twist), 136. Treo Người Nhấc Chân (Bodyweight Hanging Leg Raise), 186. Nằm Nhấc Chân (Leg Raises) (Laying Leg Raises), 187. Plank Cẳng Tay (Forearm Plank), 193. Treo Người Co Gối (Hanging Knee Raises), 194. Leo Núi Tại Chỗ (Mountain Climber), 195. Giữ Thân Hình Chuối (Hollow Hold), 413. Gập Bụng Đạp Xe (Bicycle Crunches), 414. Kéo Cáp Chặt Gỗ (Cable Woodchop).
    - Khác: 72. Nhón Bắp Chân Ngồi (Seated Calf Raise), 73. Nhón Bắp Chân Với Máy Smith (Smith Machine Calf Raise), 188. Nhón Bắp Chân Đứng Với Máy (Machine Standing Calf Raises), 189. Nhún Cầu Vai Với Tạ Tay (Dumbbell Shrug), 196. Nhón Bắp Chân Với Tạ Ấm (Kettlebell Calf Raise), 269. Burpees (Nhảy Hít Đất).

    **Yêu cầu phân tích:**
    1. Đánh giá vóc dáng hiện tại.
    2. Chỉ định ĐÚNG 6 bài tập từ danh sách trên để cải thiện cơ thể. CẤM trả về tên chung chung như "Tập cơ tay".
    3. Trả về đúng tên bài tập tiếng Việt (kèm tên tiếng Anh trong ngoặc) NHƯ TRONG DANH SÁCH TRÊN.

    Vui lòng trả lời bằng tiếng Việt, định dạng JSON với cấu trúc:
    {{
        "body_type": "Dáng vóc cụ thể",
        "body_analysis": "Phân tích cụ thể...",
        "title": "Kế hoạch tập luyện tối ưu",
        "exercises": [
            "Tên tiếng Việt (Tên tiếng Anh): reps x sets, hướng dẫn ngắn"
        ],
        "exercises_en": [
            "Tên tiếng Anh chính xác từ danh sách (VD: Barbell Bench Press)"
        ],
        "nutrition_advice": "...",
        "lifestyle_tips": "...",
        "estimated_timeline": "...",
        "general_advice": "..."
    }}

    Chỉ trả về JSON, không có văn bản nào khác.
70), Cầu Mông (Glute Bridge) (271).

    **Yêu cầu phân tích:**
    1. Đánh giá vóc dáng hiện tại.
    2. Đề xuất đúng 6 bài tập gym từ danh sách trên để cải thiện cơ thể.
    3. Trả về tên bài tập chính xác như trong danh sách trên (VD: "Hít Đất", "Squat Với Tạ Đòn").

    Vui lòng trả lời bằng tiếng Việt, định dạng JSON với cấu trúc:
    {{
        "body_type": "...",
        "body_analysis": "...",
        "title": "...",
        "exercises": [
            "Tên bài tập chính xác từ danh sách: Mô tả ngắn gọn, reps/sets"
        ],
        "nutrition_advice": "...",
        "lifestyle_tips": "...",
        "estimated_timeline": "...",
        "general_advice": "..."
    }}
    
    Chỉ trả về JSON, không có văn bản nào khác.
    """

    try:
        text_response = _groq_generate_json(prompt, timeout_sec=120)

        # Tìm và parse JSON
        json_start = text_response.find("{")
        json_end = text_response.rfind("}") + 1

        if json_start != -1 and json_end != -1 and json_start < json_end:
            json_str = text_response[json_start:json_end]
            recommendations = json.loads(json_str)

            # Thêm số đo vào kết quả
            recommendations["measurements"] = measurements
            recommendations["unit"] = unit

            return recommendations
        else:
            raise ValueError(f"AI không trả về JSON hợp lệ: {text_response}")

    except Exception as e:
        print(f"Lỗi khi gọi Groq API: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi Groq API: {e}")


# --- ENDPOINT API ---


@app.post("/analyze-image/")
async def analyze_image(
    file: UploadFile = File(...), known_height_cm: Optional[float] = Form(None)
):
    """
    Phân tích ảnh tư thế và trả về các số đo cơ thể kèm gợi ý từ AI.

    Args:
        file: File ảnh upload
        known_height_cm: Chiều cao thực tế (cm) - optional, để quy đổi sang cm

    Returns:
        JSON chứa:
        - analysis_data: Phân tích từ AI
        - measurements: Các số đo chi tiết (px và cm nếu có)
        - processed_image_url: URL ảnh đã xử lý
    """
    # Đọc file ảnh
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Không thể đọc file ảnh.")

    print(f"\n{'=' * 60}")
    print(f"Đang xử lý ảnh: {file.filename}")
    if known_height_cm:
        print(f"Chiều cao thực tế: {known_height_cm} cm")
    print(f"{'=' * 60}\n")

    # Phân tích tư thế với MediaPipe Pose
    try:
        annotated_image, ratio, measurements = analyze_pose_with_model(
            pose_model,
            image,
            known_height_cm=known_height_cm,
        )
    except Exception as e:
        print(f"✗ Lỗi khi chạy MediaPipe pose analyzer: {e}")
        raise HTTPException(status_code=500, detail=f"Pose analysis failed: {e}")

    # Khởi tạo response mặc định
    response_data = {
        "success": False,
        "message": "Không phát hiện được cơ thể trong ảnh",
        "analysis_data": {
            "body_type": "Không xác định",
            "body_analysis": "Không thể phân tích",
            "title": "Không phát hiện được cơ thể",
            "exercises": [],
            "nutrition_advice": "",
            "lifestyle_tips": "",
            "estimated_timeline": "",
            "general_advice": "Vui lòng thử lại với ảnh rõ ràng hơn, đứng thẳng và toàn thân.",
        },
        "measurements": None,
        "processed_image_url": None,
    }

    # Nếu phát hiện được cơ thể và có đủ số đo
    if annotated_image is not None and measurements is not None:
        # Kiểm tra xem có đủ số đo quan trọng không
        has_valid_measurements = (
            measurements["confidence_flags"].get("shoulder_width")
            and measurements["confidence_flags"].get("hip_width")
            and measurements["confidence_flags"].get("height")
        )

        if has_valid_measurements:
            print("✓ Phát hiện đầy đủ các điểm khớp quan trọng")
            print(f"✓ Số đo pixel: {measurements['pixel_measurements']}")
            if measurements["cm_measurements"]:
                print(f"✓ Số đo cm: {measurements['cm_measurements']}")

            # Gọi Groq để phân tích
            try:
                ai_recommendations = get_ai_recommendations(measurements)

                # Bổ sung phân loại từ module đo lường (nếu có)
                cls = measurements.get("classifications") or {}
                if cls.get("shape_type"):
                    ai_recommendations["shape_type"] = cls["shape_type"]
                if cls.get("somatotype"):
                    ai_recommendations["somatotype"] = cls["somatotype"]

                # Chuẩn hóa trường advice cho FE (fallback từ các trường khác)
                if "advice" not in ai_recommendations:
                    ai_recommendations["advice"] = (
                        ai_recommendations.get("general_advice")
                        or ai_recommendations.get("nutrition_advice")
                        or ""
                    )

                response_data = {
                    "success": True,
                    "message": "Phân tích thành công",
                    "analysis_data": ai_recommendations,
                    "measurements": {
                        "pixel_measurements": measurements["pixel_measurements"],
                        "cm_measurements": measurements["cm_measurements"],
                        "scale_cm_per_px": measurements["scale_cm_per_px"],
                        "confidence_flags": measurements["confidence_flags"],
                        "classifications": measurements.get("classifications", {}),
                    },
                    "processed_image_url": None,  # Sẽ cập nhật bên dưới
                }

                print("✓ Đã nhận phân tích từ Groq AI (Llama)")

            except Exception as e:
                print(f"✗ Lỗi khi gọi AI: {e}")
                response_data["message"] = (
                    f"Phát hiện cơ thể nhưng lỗi phân tích AI: {str(e)}"
                )
                response_data["measurements"] = {
                    "pixel_measurements": measurements["pixel_measurements"],
                    "cm_measurements": measurements["cm_measurements"],
                    "scale_cm_per_px": measurements["scale_cm_per_px"],
                    "confidence_flags": measurements["confidence_flags"],
                }
        else:
            print("✗ Không đủ điểm khớp để phân tích")
            missing_parts = []
            if not measurements["confidence_flags"].get("shoulder_width"):
                missing_parts.append("vai")
            if not measurements["confidence_flags"].get("hip_width"):
                missing_parts.append("hông")
            if not measurements["confidence_flags"].get("height"):
                missing_parts.append("chiều cao")

            response_data["message"] = f"Không phát hiện rõ: {', '.join(missing_parts)}"

    # Lưu ảnh đã xử lý (dù có phát hiện hay không)
    try:
        output_filename = f"processed_{file.filename}"
        output_path = os.path.join("processed_images", output_filename)

        if annotated_image is not None:
            cv2.imwrite(output_path, annotated_image)
        else:
            # Nếu không có kết quả, lưu ảnh gốc
            cv2.imwrite(output_path, image)

        image_url = f"http://localhost:8000/processed/{output_filename}"
        response_data["processed_image_url"] = image_url

        print(f"\n✓ Đã lưu ảnh xử lý: {output_path}")
        print(f"{'=' * 60}\n")
    except Exception as e:
        print(f"✗ Lỗi khi lưu ảnh xử lý: {e}")

    return response_data


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Fitnexus AI Trainer API",
        "version": "2.0",
        "features": [
            "MediaPipe Pose Detection",
            "Body Measurements (px and cm)",
            "Groq AI Analysis (Llama)",
            "Personalized Workout Recommendations",
        ],
    }


@app.get("/health")
async def health_check():
    """Kiểm tra trạng thái của các services"""
    return {
        "pose_model": "loaded" if pose_model else "failed",
        "groq_api": "configured" if GROQ_API_KEY else "not_configured",
        "processed_images_dir": os.path.exists("processed_images"),
    }


# Lệnh để chạy server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
