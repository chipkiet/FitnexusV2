# core/pose_analyzer.py
import cv2
from ultralytics import YOLO
import numpy as np

# Các chỉ số của keypoint theo mô hình YOLOv8-pose
# Vai trái: 5, Vai phải: 6
# Hông trái: 11, Hông phải: 12
YOLO_KP_INDICES = {
    "left_shoulder": 5,
    "right_shoulder": 6,
    "left_hip": 11,
    "right_hip": 12,
}

def load_yolo_model(model_path='yolov8n-pose.pt'):
    """Tải mô hình YOLOv8-pose đã được huấn luyện sẵn."""
    try:
        model = YOLO(model_path)
        print("Đã tải YOLOv8-pose model thành công.")
        return model
    except Exception as e:
        print(f"Lỗi khi tải mô hình YOLOv8: {e}")
        return None

def _calculate_ratio_from_keypoints(keypoints):
    """Tính toán tỷ lệ vai/hông từ các keypoints."""
    try:
        # Lấy tọa độ X và độ tin cậy của các điểm cần thiết
        ls_x, _, ls_conf = keypoints[YOLO_KP_INDICES["left_shoulder"]]
        rs_x, _, rs_conf = keypoints[YOLO_KP_INDICES["right_shoulder"]]
        lh_x, _, lh_conf = keypoints[YOLO_KP_INDICES["left_hip"]]
        rh_x, _, rh_conf = keypoints[YOLO_KP_INDICES["right_hip"]]

        # Chỉ tính toán nếu tất cả các điểm đều được phát hiện với độ tin cậy > 0.5
        if min(ls_conf, rs_conf, lh_conf, rh_conf) < 0.5:
            print("Cảnh báo: Không thể xác định rõ tất cả các khớp vai và hông.")
            return None

        shoulder_width = abs(ls_x - rs_x)
        hip_width = abs(lh_x - rh_x)

        if hip_width > 0:
            return shoulder_width / hip_width
        return None
    except IndexError:
        print("Lỗi: Không đủ keypoints để tính toán tỷ lệ.")
        return None

def analyze_pose_with_yolo(model, image):
    """Phân tích ảnh bằng YOLO, trả về ảnh đã vẽ và tỷ lệ."""
    results = model(image)

    if not results or not results[0].keypoints:
        return None, None

    keypoints_tensor = results[0].keypoints.data[0]
    keypoints_list = keypoints_tensor.cpu().numpy()

    if len(keypoints_list) == 0:
        return None, None

    # Vẽ kết quả lên ảnh
    annotated_image = results[0].plot()
    
    # Tính toán tỷ lệ
    ratio = _calculate_ratio_from_keypoints(keypoints_list)

    return annotated_image, ratio