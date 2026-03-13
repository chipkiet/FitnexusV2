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

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from core.pose_analyzer import (
    load_pose_model,
    analyze_pose_with_model,
    draw_measurements_on_image,
)

app = FastAPI(title="Fitnexus AI Trainer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv
load_dotenv(override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "PASTE GROQ API KEY HERE"

if not GROQ_API_KEY or GROQ_API_KEY == "gsk_VUI_LONG_THAY_KHOA_CUA_BAN":
    print("LỖI: Bạn chưa cấu hình khóa API cho GROQ.")
    sys.exit(1)

groq_client = groq.Groq(api_key=GROQ_API_KEY)

GROQ_MODELS = [
    os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

# ─── Exercise Database ────────────────────────────────────────────────────────
# Single source of truth: (exercise_id, name_vi, name_en)
# Derived from the exercises table. Keep this in sync with the DB.
EXERCISE_DB = [
    (1,   "Đẩy Ngực Ngang Thanh Đòn",                   "Barbell Bench Press"),
    (2,   "Đẩy Ngực Ngang Tạ Tay",                       "Dumbbell Bench Press"),
    (3,   "Hít Đất",                                      "Push Up"),
    (16,  "Squat Với Tạ Đòn",                             "Barbell Squat"),
    (21,  "Romanian Deadlift Với Tạ Đòn",                 "Barbell Romanian Deadlift"),
    (39,  "Hip Thrust Với Tạ Đòn",                        "Barbell Hip Thrust"),
    (40,  "Hít Xà Đơn",                                   "Pull Ups"),
    (41,  "Kéo Xô Máy",                                   "Machine Pulldown"),
    (42,  "Đẩy Tạ Đòn Qua Đầu",                          "Barbell Overhead Press"),
    (43,  "Dang Tạ Tay Sang Bên",                         "Dumbbell Lateral Raise"),
    (64,  "Cuốn Tạ Đòn",                                  "Barbell Curl"),
    (65,  "Cuốn Tạ Đơn",                                  "Dumbbell Curl"),
    (66,  "Đẩy Tạ Đơn Sau Đầu",                          "Dumbbell Seated Overhead Tricep Extension"),
    (67,  "Đẩy Cáp Tay Sau V-Bar",                       "Machine Cable V Bar Push Downs"),
    (68,  "Gập Bụng",                                     "Crunches"),
    (69,  "Plank Với Bóng",                               "Medicine Ball Plank"),
    (70,  "Cuốn Cổ Tay Tạ Đơn",                          "Dumbbell Wrist Curl"),
    (71,  "Cuốn Cổ Tay Tạ Đòn",                          "Barbell Wrist Curl"),
    (72,  "Nhón Bắp Chân Ngồi",                           "Seated Calf Raise"),
    (73,  "Nhón Bắp Chân Với Máy Smith",                  "Smith Machine Calf Raise"),
    (94,  "Đẩy Ngực Dốc Lên Thanh Đòn",                  "Incline Barbell Bench Press"),
    (95,  "Chèo Tạ Đòn Cúi Người",                       "Barbell Bent Over Row"),
    (96,  "Deadlift Với Tạ Đòn",                          "Barbell Deadlift"),
    (97,  "Ép Ngực Với Cáp",                              "Cable Pec Fly"),
    (98,  "Nâng Tạ Đơn Trước Mặt",                       "Dumbbell Front Raise"),
    (99,  "Đạp Đùi Với Máy",                              "Machine Leg Press"),
    (100, "Đá Đùi Với Máy",                               "Machine Leg Extension"),
    (101, "Vặn Người Kiểu Nga",                           "Bodyweight Russian Twist"),
    (102, "Kéo Cáp Cho Vai Sau",                          "Machine Face Pulls"),
    (132, "Nhún Cầu Vai Thanh Đòn",                       "Barbell Shrugs"),
    (133, "Cuốn Chân Nằm Với Máy",                        "Machine Lying Leg Curl"),
    (134, "Đẩy Ngực Dốc Xuống Thanh Đòn",                "Barbell Decline Bench Press"),
    (135, "Lunge Bước Đi",                                "Bodyweight Walking Lunges"),
    (136, "Treo Người Nhấc Chân",                         "Bodyweight Hanging Leg Raise"),
    (171, "Đẩy Tạ Đơn Qua Đầu Khi Ngồi",                "Dumbbell Seated Overhead Press"),
    (172, "Dang Một Tay Với Cáp Thấp",                   "Cable Low Single Arm Lateral Raise"),
    (173, "Hít Đất Pike Chân Trên Cao",                   "Elevated Pike Press"),
    (174, "Ép Tạ Đơn Vai Sau Khi Ngồi",                  "Dumbbell Seated Rear Delt Fly"),
    (175, "Kéo Cáp Một Tay Tập Xô (Lat Prayer)",         "Cable Single Arm Lat Prayer"),
    (176, "Kéo Cáp Qua Chân (Pull Through)",              "Cable Pull Through"),
    (177, "Hít Xà Ngược (Inverted Row)",                  "Inverted Row"),
    (178, "Đẩy Ngực Dốc Lên Với Tạ Tay",                "Dumbbell Incline Bench Press"),
    (179, "Ép Ngực Với Máy (Pec Deck)",                  "Machine Pec Fly"),
    (180, "Nằm Dang Tạ Tay Tập Ngực",                    "Dumbbell Fly"),
    (181, "Xà Kép Tập Ngực (Chest Dips)",                "Chest Dips"),
    (182, "Cuốn Tạ Tay Kiểu Búa (Hammer Curl)",          "Dumbbell Hammer Curl"),
    (183, "Chống Đẩy Sau Với Ghế (Bench Dips)",          "Bench Dips"),
    (184, "Đá Tạ Tay Sau (Dumbbell Kickback)",           "Dumbbell Kickback"),
    (185, "Cuốn Tạ Tập Trung (Concentration Curl)",      "Concentration Curl"),
    (186, "Nằm Nhấc Chân (Leg Raises)",                  "Laying Leg Raises"),
    (187, "Plank Cẳng Tay (Forearm Plank)",              "Forearm Plank"),
    (188, "Nhón Bắp Chân Đứng Với Máy",                  "Machine Standing Calf Raises"),
    (189, "Nhún Cầu Vai Với Tạ Tay",                     "Dumbbell Shrug"),
    (190, "Kéo Tạ Đòn Thẳng Đứng (Upright Row)",        "Barbell Upright Row"),
    (191, "Cuốn Cổ Tay Tạ Đòn Sau Lưng",                "Barbell Behind The Back Wrist Curl"),
    (192, "Nằm Đẩy Tạ Đòn Sau Đầu (Skull Crusher)",     "Barbell Skull Crusher"),
    (193, "Treo Người Co Gối (Hanging Knee Raises)",     "Hanging Knee Raises"),
    (194, "Leo Núi Tại Chỗ (Mountain Climber)",          "Mountain Climber"),
    (195, "Giữ Thân Hình Chuối (Hollow Hold)",           "Hollow Hold"),
    (196, "Nhón Bắp Chân Với Tạ Ấm",                    "Kettlebell Calf Raise"),
    (197, "Cuốn Tay Trước Với Cáp",                      "Cable Bicep Curl"),
    (198, "Chống Xà Kép Tập Tay Sau",                    "Tricep Dips"),
    (199, "Vung Tạ Ấm (Kettlebell Swing)",               "Kettlebell Swing"),
    (200, "Squat Với Tạ Tay (Goblet Squat)",             "Dumbbell Goblet Squat"),
    (201, "Kéo Cáp Ngồi (Seated Cable Row)",             "Seated Cable Row"),
    (202, "Nằm Vớt Tạ (Dumbbell Pullover)",              "Dumbbell Pullover"),
    (269, "Burpees (Nhảy Hít Đất)",                      "Burpees"),
    (270, "Siêu Nhân (Superman)",                        "Superman"),
    (271, "Cầu Mông (Glute Bridge)",                     "Bodyweight Glute Bridge"),
    (272, "Đá Chân Sang Bên (Fire Hydrant)",             "Fire Hydrant"),
    (413, "Gập Bụng Đạp Xe (Bicycle Crunches)",         "Bicycle Crunches"),
    (414, "Kéo Cáp Chặt Gỗ (Cable Woodchop)",           "Cable Woodchop"),
    (415, "Dang Tạ Tay Ngược (Reverse Fly)",             "Dumbbell Reverse Fly"),
    (416, "Hít Đất Chân Cao (Decline Push-up)",          "Decline Push-ups"),
    (417, "Ép Cáp Từ Cao Đến Thấp",                     "High-to-Low Cable Fly"),
]

# Build lookup maps for fast matching in frontend
_VI_TO_ID  = {row[1]: row[0] for row in EXERCISE_DB}
_EN_TO_ID  = {row[2]: row[0] for row in EXERCISE_DB}
_ID_TO_ROW = {row[0]: row    for row in EXERCISE_DB}

def _build_exercise_index_for_prompt() -> str:
    """Return a numbered list of 'ID|name_vi|name_en' used inside the prompt."""
    lines = []
    for eid, name_vi, name_en in EXERCISE_DB:
        lines.append(f"{eid}|{name_vi}|{name_en}")
    return "\n".join(lines)


# ─── Groq helper ─────────────────────────────────────────────────────────────

def _groq_generate_json(prompt: str, timeout_sec: int = 120):
    last_err = None
    for model_name in GROQ_MODELS:
        try:
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
    raise last_err if last_err else RuntimeError("Groq API call failed")


# ─── Pose model ───────────────────────────────────────────────────────────────

pose_model = load_pose_model()

os.makedirs("processed_images", exist_ok=True)
app.mount("/processed", StaticFiles(directory="processed_images"), name="processed")


# ─── AI recommendation function ──────────────────────────────────────────────

def get_ai_recommendations(measurements_data: dict) -> dict:
    """
    Call the LLM and return a recommendations dict whose `exercise_ids` field
    contains only valid IDs from EXERCISE_DB.  The fields `exercises` (vi) and
    `exercises_en` (en) are reconstructed from the DB after the LLM call so
    that the frontend matching step always succeeds.
    """
    if measurements_data.get("cm_measurements"):
        measurements = measurements_data["cm_measurements"]
        unit = "cm"
    else:
        measurements = measurements_data.get("pixel_measurements", {})
        unit = "px"

    exercise_index = _build_exercise_index_for_prompt()

    prompt = f"""
You are a professional fitness coach. Analyze the body measurements and select the most suitable exercises.

BODY MEASUREMENTS ({unit}):
- Shoulder width : {measurements.get("shoulder_width", "N/A")}
- Waist width    : {measurements.get("waist_width",    "N/A")}
- Hip width      : {measurements.get("hip_width",      "N/A")}
- Height         : {measurements.get("height",         "N/A")}
- Leg length     : {measurements.get("leg_length",     "N/A")}

AVAILABLE EXERCISE DATABASE (format: exercise_id|name_vi|name_en):
{exercise_index}

TASK:
1. Determine the body shape / somatotype from the measurements.
2. Select EXACTLY 6 exercises that are most beneficial for this body type.
3. You MUST only use exercise_ids that appear in the list above.
4. Do NOT invent new exercise names. Copy the name_vi and name_en fields exactly.

RULES — violating these will break the application:
- The `exercise_ids` array must contain exactly 6 integer IDs from the list above.
- `exercises`    → copy the exact `name_vi` strings for those IDs (same order).
- `exercises_en` → copy the exact `name_en` strings for those IDs (same order).
- No extra text, no markdown, only valid JSON.

REQUIRED JSON STRUCTURE:
{{
  "body_type"         : "<brief body shape label in Vietnamese>",
  "shape_type"        : "<Rectangle | Inverted Triangle | Triangle | Hourglass | Oval>",
  "somatotype"        : "<Ectomorph | Mesomorph | Endomorph>",
  "body_analysis"     : "<2-3 sentence analysis in Vietnamese>",
  "title"             : "<plan title in Vietnamese>",
  "exercise_ids"      : [<id1>, <id2>, <id3>, <id4>, <id5>, <id6>],
  "exercises"         : ["<exact name_vi 1>", "<exact name_vi 2>", "<exact name_vi 3>", "<exact name_vi 4>", "<exact name_vi 5>", "<exact name_vi 6>"],
  "exercises_en"      : ["<exact name_en 1>", "<exact name_en 2>", "<exact name_en 3>", "<exact name_en 4>", "<exact name_en 5>", "<exact name_en 6>"],
  "nutrition_advice"  : "<brief nutrition tip in Vietnamese>",
  "lifestyle_tips"    : "<brief lifestyle tip in Vietnamese>",
  "estimated_timeline": "<e.g. 8-12 tuần>"
}}
"""

    try:
        text_response = _groq_generate_json(prompt)
        json_start = text_response.find("{")
        json_end   = text_response.rfind("}") + 1
        recommendations = json.loads(text_response[json_start:json_end])
    except Exception as e:
        print(f"[AI] Parse error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # ── Validation + self-healing ─────────────────────────────────────────────
    # Re-derive exercises and exercises_en directly from the DB using the
    # returned IDs so that even if the LLM drifts on the text fields, the
    # frontend will always find an exact match.
    raw_ids = recommendations.get("exercise_ids", [])

    validated_ids   = []
    names_vi        = []
    names_en        = []

    for eid in raw_ids:
        try:
            eid_int = int(eid)
        except (ValueError, TypeError):
            print(f"[AI] Skipping non-integer id: {eid}")
            continue

        row = _ID_TO_ROW.get(eid_int)
        if row is None:
            print(f"[AI] ID {eid_int} not found in EXERCISE_DB — skipping")
            continue

        validated_ids.append(eid_int)
        names_vi.append(row[1])
        names_en.append(row[2])

    # Overwrite whatever the LLM produced with authoritative DB values
    recommendations["exercise_ids"]  = validated_ids
    recommendations["exercises"]     = names_vi
    recommendations["exercises_en"]  = names_en
    recommendations["measurements"]  = measurements
    recommendations["unit"]          = unit

    if len(validated_ids) == 0:
        print("[AI] WARNING: No valid exercise IDs returned by the model.")

    return recommendations


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/analyze-image/")
async def analyze_image(
    file: UploadFile = File(...),
    known_height_cm: Optional[float] = Form(None),
):
    contents = await file.read()
    np_arr   = np.frombuffer(contents, np.uint8)
    image    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Lỗi file ảnh.")

    try:
        annotated_image, ratio, measurements = analyze_pose_with_model(
            pose_model, image, known_height_cm=known_height_cm
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if annotated_image is None or measurements is None:
        return {"success": False, "message": "Không tìm thấy cơ thể"}

    ai_recommendations = get_ai_recommendations(measurements)

    response_data = {
        "success"              : True,
        "message"              : "Thành công",
        "analysis_data"        : ai_recommendations,
        "measurements"         : measurements,
        "processed_image_url"  : None,
    }

    output_filename = f"processed_{file.filename}"
    output_path     = os.path.join("processed_images", output_filename)
    cv2.imwrite(output_path, annotated_image)
    response_data["processed_image_url"] = f"http://localhost:8000/processed/{output_filename}"

    return response_data


@app.get("/")
async def root():
    return {"status": "online"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
