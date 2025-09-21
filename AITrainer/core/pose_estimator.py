# core/pose_estimator.py

import cv2
import mediapipe as mp
from typing import Any, Tuple

# Khởi tạo giải pháp MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def process_image(image_path: str) -> Tuple[Any, Any]:
    """
    Đọc một hình ảnh, phát hiện các điểm mốc tư thế và trả về kết quả.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            print(f"Lỗi: Không thể đọc hình ảnh từ đường dẫn: {image_path}")
            return None, None

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_rgb.flags.writeable = False

        # Khởi tạo mô hình Pose với giá trị mặc định
        with mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as pose:
            
            results = pose.process(image_rgb)
        
        return image, results

    except Exception as e:
        print(f"Đã xảy ra lỗi trong quá trình xử lý ảnh: {e}")
        return None, None


def draw_landmarks_on_image(image: Any, results: Any) -> Any:
    """Vẽ các điểm mốc và đường nối lên hình ảnh."""
    if not results or not results.pose_landmarks:
        return image

    annotated_image = image.copy()
    mp_drawing.draw_landmarks(
        image=annotated_image,
        landmark_list=results.pose_landmarks,
        connections=mp_pose.POSE_CONNECTIONS,
        landmark_drawing_spec=mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
        connection_drawing_spec=mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
    )
    return annotated_image