# core/recommender.py

import json
import os
from typing import Dict, Any, List
import config

def load_exercise_database() -> List[Dict[str, Any]]:
    """Tải cơ sở dữ liệu bài tập từ file JSON."""
    db_path = os.path.join(config.DATA_FOLDER, config.EXERCISE_DATABASE_FILE)
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def get_body_profile_and_recommendations(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Xác định hồ sơ vóc dáng và đưa ra chiến lược tập luyện phù hợp.
    """
    if not features or features.get("error"):
        return {"error": features.get("error", "Lỗi không xác định.")}

    sh_ratio = features.get("shoulder_hip_ratio", 0)
    lt_ratio = features.get("leg_torso_ratio", 0)
    exercise_db = load_exercise_database()
    
    # Logic phát hiện trường hợp đặc biệt (Endomorph) dựa trên các chỉ số bất thường
    is_abnormal_sh = sh_ratio > config.ENDOMORPH_DETECTION_THRESHOLDS["ABNORMAL_SHOULDER_HIP_RATIO"]
    is_abnormal_lt = lt_ratio > config.ENDOMORPH_DETECTION_THRESHOLDS["ABNORMAL_LEG_TORSO_RATIO"]

    if is_abnormal_sh or is_abnormal_lt:
        body_profile = "Tạng người Endomorph (Ưu tiên sức khỏe toàn diện)"
        strategy = (
            "Phân tích cho thấy tạng người của bạn có xu hướng dễ tích trữ mỡ và cần một cách tiếp cận toàn diện. "
            "Chiến lược tốt nhất là tập trung vào các bài tập toàn thân (Full Body) để tối đa hóa việc đốt calo, "
            "kết hợp với cardio/bài tập sức bền để cải thiện sức khỏe tim mạch."
        )
        focus_exercises = [ex for ex in exercise_db if ex["target_muscle_group"] in ["Toàn thân", "Core"]]
        secondary_exercises = [ex for ex in exercise_db if ex["type"] == "Sức bền"]
        vertical_analysis = "Tỷ lệ dọc không thể ước tính chính xác do đặc điểm hình thể."
    else:
        # Logic cho các tạng người thông thường
        if sh_ratio > config.SHOULDER_HIP_RATIO_THRESHOLDS["WIDE_SHOULDERS"]:
            body_profile = "Dáng tam giác ngược (Vai rộng)"
            focus_group_name = "Thân dưới"
        elif sh_ratio < config.SHOULDER_HIP_RATIO_THRESHOLDS["NARROW_SHOULDERS"]:
            body_profile = "Dáng quả lê (Hông rộng)"
            focus_group_name = "Thân trên"
        else:
            body_profile = "Dáng chữ nhật (Cân đối)"
            focus_group_name = "Toàn thân"
        
        strategy = f"Chiến lược gợi ý là tập trung phát triển các nhóm cơ {focus_group_name} để tạo sự cân đối cho vóc dáng."
        focus_exercises = [ex for ex in exercise_db if ex["target_muscle_group"] == focus_group_name]
        secondary_exercises = [ex for ex in exercise_db if ex["target_muscle_group"] == "Core"]
        if focus_group_name == "Toàn thân":
            focus_exercises = exercise_db
            secondary_exercises = []
            
        vertical_analysis = ""
        if lt_ratio > config.LEG_TORSO_RATIO_THRESHOLDS["LONG_LEGS"]:
            vertical_analysis = "Tỷ lệ chân dài hơn lưng."
        elif lt_ratio < config.LEG_TORSO_RATIO_THRESHOLDS["SHORT_LEGS"]:
            vertical_analysis = "Tỷ lệ lưng dài hơn chân."
    
    return {
        "error": None,
        "body_profile": body_profile,
        "strategy": strategy,
        "vertical_analysis": vertical_analysis,
        "posture_analysis": features.get("posture_analysis", "N/A"),
        "metrics": {
            "Tỷ lệ Xương Vai/Hông": f"{sh_ratio:.2f}",
            "Tỷ lệ Chân/Lưng (Ước tính)": f"{lt_ratio:.2f}"
        },
        "recommendations": {
            "focus_exercises": focus_exercises,
            "secondary_exercises": secondary_exercises
        }
    }