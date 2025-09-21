# core/feature_extractor.py

import numpy as np
from mediapipe.python.solutions.pose import PoseLandmark
from typing import List, Dict, Any, Tuple
import config

LandmarkList = List[Any] # Định nghĩa kiểu cho dễ đọc

def check_essential_landmarks_visible(landmarks: LandmarkList) -> Tuple[bool, str]:
    """Kiểm tra các điểm mốc cần thiết có đủ rõ ràng không."""
    essential_landmarks = {
        "vai": [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
        "hông": [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
        "mắt cá chân": [PoseLandmark.LEFT_ANKLE, PoseLandmark.RIGHT_ANKLE]
    }
    for part, indices in essential_landmarks.items():
        for index in indices:
            if landmarks[index.value].visibility < config.VISIBILITY_THRESHOLD:
                if part == "mắt cá chân":
                    return False, "Ảnh không đầy đủ, không thấy rõ mắt cá chân."
                return False, f"Không thể xác định rõ phần {part}."
    return True, "Ảnh hợp lệ."

def calculate_shoulder_to_hip_ratio(landmarks: LandmarkList) -> float:
    """Tính tỷ lệ vai/hông chỉ dựa trên trục X."""
    try:
        left_shoulder_x = landmarks[PoseLandmark.LEFT_SHOULDER.value].x
        right_shoulder_x = landmarks[PoseLandmark.RIGHT_SHOULDER.value].x
        left_hip_x = landmarks[PoseLandmark.LEFT_HIP.value].x
        right_hip_x = landmarks[PoseLandmark.RIGHT_HIP.value].x

        shoulder_width = abs(right_shoulder_x - left_shoulder_x)
        hip_width = abs(right_hip_x - left_hip_x)

        return shoulder_width / hip_width if hip_width > 0.001 else 0
    except (IndexError, TypeError):
        return 0

def calculate_leg_to_torso_ratio(landmarks: LandmarkList) -> float:
    """Tính tỷ lệ chiều dài chân so với chiều dài lưng (trục Y)."""
    try:
        shoulder_y = (landmarks[PoseLandmark.LEFT_SHOULDER.value].y + landmarks[PoseLandmark.RIGHT_SHOULDER.value].y) / 2
        hip_y = (landmarks[PoseLandmark.LEFT_HIP.value].y + landmarks[PoseLandmark.RIGHT_HIP.value].y) / 2
        ankle_y = (landmarks[PoseLandmark.LEFT_ANKLE.value].y + landmarks[PoseLandmark.RIGHT_ANKLE.value].y) / 2

        torso_length = abs(hip_y - shoulder_y)
        leg_length = abs(ankle_y - hip_y)

        return leg_length / torso_length if torso_length > 0.001 else 0
    except (IndexError, TypeError):
        return 0

def analyze_posture(landmarks: LandmarkList) -> str:
    """Phân tích độ cân bằng của vai."""
    try:
        if landmarks[PoseLandmark.LEFT_SHOULDER.value].visibility < config.VISIBILITY_THRESHOLD or \
           landmarks[PoseLandmark.RIGHT_SHOULDER.value].visibility < config.VISIBILITY_THRESHOLD:
            return "Không thể phân tích do vai không rõ."
        
        left_shoulder_y = landmarks[PoseLandmark.LEFT_SHOULDER.value].y
        right_shoulder_y = landmarks[PoseLandmark.RIGHT_SHOULDER.value].y
        difference = abs(left_shoulder_y - right_shoulder_y)
        
        threshold = 0.02
        if difference < threshold:
            return "Vai tương đối cân bằng."
        elif left_shoulder_y < right_shoulder_y:
            return "Vai trái có thể cao hơn vai phải."
        else:
            return "Vai phải có thể cao hơn vai trái."
    except (IndexError, TypeError):
        return "Không thể phân tích tư thế vai."

def extract_all_features(results: Any) -> Dict[str, Any]:
    """Trích xuất tất cả các đặc trưng từ kết quả của MediaPipe."""
    if not results or not results.pose_landmarks:
        return {"error": "Không tìm thấy người trong ảnh."}

    landmarks = results.pose_landmarks.landmark
    is_valid, message = check_essential_landmarks_visible(landmarks)
    if not is_valid:
        return {"error": message}

    features = {
        "error": None,
        "shoulder_hip_ratio": calculate_shoulder_to_hip_ratio(landmarks),
        "leg_torso_ratio": calculate_leg_to_torso_ratio(landmarks),
        "posture_analysis": analyze_posture(landmarks)
    }
    return features