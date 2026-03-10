# core/pose_analyzer.py
# Sử dụng MediaPipe Tasks API (mediapipe >= 0.10.30)
import cv2
import numpy as np
import os
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision


# PoseLandmark indices (theo thứ tự MediaPipe BlazePose 33 keypoints)
class PoseLandmark:
    NOSE = 0
    LEFT_EYE_INNER = 1
    LEFT_EYE = 2
    LEFT_EYE_OUTER = 3
    RIGHT_EYE_INNER = 4
    RIGHT_EYE = 5
    RIGHT_EYE_OUTER = 6
    LEFT_EAR = 7
    RIGHT_EAR = 8
    MOUTH_LEFT = 9
    MOUTH_RIGHT = 10
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28


def load_pose_model():
    """Tạo đối tượng MediaPipe PoseLandmarker (Tasks API)."""
    print("Khởi tạo mô hình MediaPipe PoseLandmarker (Tasks API)...")

    # Tìm file model .task
    model_path = os.path.join(
        os.path.dirname(__file__), "..", "pose_landmarker_heavy.task"
    )
    model_path = os.path.abspath(model_path)

    if not os.path.exists(model_path):
        print(f"LỖI: Không tìm thấy model file: {model_path}")
        return None

    base_options = mp_python.BaseOptions(model_asset_path=model_path)
    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        output_segmentation_masks=True,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        running_mode=mp_vision.RunningMode.IMAGE,
    )
    landmarker = mp_vision.PoseLandmarker.create_from_options(options)
    print("✓ PoseLandmarker khởi tạo thành công")
    return landmarker


def _euclidean_distance(p1, p2):
    return np.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


def _calculate_measurements_from_landmarks(
    landmarks_px,
    image_width,
    image_height,
    segmentation_mask=None,
    known_height_cm=None,
):
    """
    Tính toán số đo cơ thể từ danh sách tọa độ pixel (list of (x, y, visibility)).
    landmarks_px: list 33 tuple (x_px, y_px, visibility)
    """
    measurements = {
        "pixel_measurements": {},
        "cm_measurements": {},
        "scale_cm_per_px": None,
        "confidence_flags": {},
    }

    try:

        def get_pt(idx):
            lm = landmarks_px[idx]
            return lm  # (x_px, y_px, visibility)

        ls_x, ls_y, ls_conf = get_pt(PoseLandmark.LEFT_SHOULDER)
        rs_x, rs_y, rs_conf = get_pt(PoseLandmark.RIGHT_SHOULDER)
        lh_x, lh_y, lh_conf = get_pt(PoseLandmark.LEFT_HIP)
        rh_x, rh_y, rh_conf = get_pt(PoseLandmark.RIGHT_HIP)
        la_x, la_y, la_conf = get_pt(PoseLandmark.LEFT_ANKLE)
        ra_x, ra_y, ra_conf = get_pt(PoseLandmark.RIGHT_ANKLE)
        nose_x, nose_y, nose_conf = get_pt(PoseLandmark.NOSE)

        # 1. Shoulder width
        if min(ls_conf, rs_conf) >= 0.5:
            inner_shoulder_width = abs(ls_x - rs_x)
            shoulder_width_px = inner_shoulder_width * 1.3
            cx = (ls_x + rs_x) / 2
            draw_ls_x = cx + (ls_x - cx) * 1.3
            draw_rs_x = cx + (rs_x - cx) * 1.3
            measurements["pixel_measurements"]["shoulder_width"] = float(
                shoulder_width_px
            )
            measurements["confidence_flags"]["shoulder_width"] = True
            measurements["draw_points"] = {
                "shoulder": ((draw_ls_x, ls_y), (draw_rs_x, rs_y))
            }
        else:
            measurements["confidence_flags"]["shoulder_width"] = False
            measurements.setdefault("draw_points", {})

        # 2. Hip width
        if min(lh_conf, rh_conf) >= 0.5:
            inner_hip_width = abs(lh_x - rh_x)
            hip_width_px = inner_hip_width * 1.38
            cx = (lh_x + rh_x) / 2
            draw_lh_x = cx + (lh_x - cx) * 1.38
            draw_rh_x = cx + (rh_x - cx) * 1.38
            measurements["pixel_measurements"]["hip_width"] = float(hip_width_px)
            measurements["confidence_flags"]["hip_width"] = True
            measurements.setdefault("draw_points", {})["hip"] = (
                (draw_lh_x, lh_y),
                (draw_rh_x, rh_y),
            )
        else:
            measurements["confidence_flags"]["hip_width"] = False

        # 3. Waist width
        if min(ls_conf, rs_conf, lh_conf, rh_conf) >= 0.5:
            waist_ratio = 0.45
            lw_x = lh_x + waist_ratio * (ls_x - lh_x)
            lw_y = lh_y + waist_ratio * (ls_y - lh_y)
            rw_x = rh_x + waist_ratio * (rs_x - rh_x)
            rw_y = rh_y + waist_ratio * (rs_y - rh_y)
            inner_waist_width = abs(lw_x - rw_x)
            waist_width_px = inner_waist_width * 1.25
            cx = (lw_x + rw_x) / 2
            draw_lw_x = cx + (lw_x - cx) * 1.25
            draw_rw_x = cx + (rw_x - cx) * 1.25
            measurements["pixel_measurements"]["waist_width"] = float(waist_width_px)
            measurements["confidence_flags"]["waist_width"] = True
            measurements.setdefault("draw_points", {})["waist"] = (
                (draw_lw_x, lw_y),
                (draw_rw_x, rw_y),
            )
        else:
            measurements["confidence_flags"]["waist_width"] = False

        # 4. Height
        all_ys = [(lm_pt[1], lm_pt[2]) for lm_pt in landmarks_px]
        valid_ys = [y for y, vis in all_ys if vis > 0.5]
        if len(valid_ys) > 5:
            min_y = min(valid_ys)
            if nose_conf > 0.5:
                min_y = nose_y - abs(ls_x - rs_x) * 0.4
            max_y = max(valid_ys)
            height_px = max_y - min_y
            measurements["pixel_measurements"]["height"] = float(height_px)
            measurements["confidence_flags"]["height"] = True
        else:
            measurements["confidence_flags"]["height"] = False

        # 5. Leg length
        if min(lh_conf, rh_conf, la_conf, ra_conf) >= 0.5:
            mid_hip_y = (lh_y + rh_y) / 2
            mid_ankle_y = (la_y + ra_y) / 2
            leg_length_px = abs(mid_ankle_y - mid_hip_y)
            measurements["pixel_measurements"]["leg_length"] = float(leg_length_px)
            measurements["confidence_flags"]["leg_length"] = True
            measurements.setdefault("draw_points", {})["leg"] = (
                ((lh_x + rh_x) / 2, mid_hip_y),
                ((la_x + ra_x) / 2, mid_ankle_y),
            )
        else:
            measurements["confidence_flags"]["leg_length"] = False

        # 6. Ratios
        if measurements["confidence_flags"].get("shoulder_width") and measurements[
            "confidence_flags"
        ].get("hip_width"):
            ratio = (
                measurements["pixel_measurements"]["shoulder_width"]
                / measurements["pixel_measurements"]["hip_width"]
            )
            measurements["pixel_measurements"]["shoulder_hip_ratio"] = float(ratio)

        if measurements["confidence_flags"].get("waist_width") and measurements[
            "confidence_flags"
        ].get("hip_width"):
            whr = (
                measurements["pixel_measurements"]["waist_width"]
                / measurements["pixel_measurements"]["hip_width"]
            )
            measurements["pixel_measurements"]["waist_hip_ratio"] = float(whr)

        # 7. Conversions to cm
        if known_height_cm and measurements["confidence_flags"].get("height"):
            height_px = measurements["pixel_measurements"]["height"]
            scale = known_height_cm / height_px
            measurements["scale_cm_per_px"] = float(scale)
            for k, v in measurements["pixel_measurements"].items():
                if k not in ["shoulder_hip_ratio", "waist_hip_ratio"]:
                    measurements["cm_measurements"][k] = v * scale

        # 8. Classifications
        try:
            shp = measurements["pixel_measurements"].get("shoulder_hip_ratio")
            whr = measurements["pixel_measurements"].get("waist_hip_ratio")
            h_px = measurements["pixel_measurements"].get("height", 0)
            l_px = measurements["pixel_measurements"].get("leg_length", 0)
            s_px = measurements["pixel_measurements"].get("shoulder_width", 0)

            def get_shape(s_h_r, w_h_r):
                if not s_h_r or not w_h_r:
                    return None
                if s_h_r > 1.15 and w_h_r < 0.9:
                    return "Inverted Triangle"
                if s_h_r < 0.9 and w_h_r >= 0.9:
                    return "Triangle"
                if abs(s_h_r - 1.0) <= 0.1 and 0.9 <= w_h_r <= 1.05:
                    return "Rectangle"
                return "Hourglass" if w_h_r < 0.85 else "Rectangle"

            def get_soma(s, h, l, w_h_r):
                if not h:
                    return None
                s_h = s / h
                l_h = l / h
                if s_h < 0.23 and l_h > 0.53:
                    return "Ectomorph"
                if 0.23 <= s_h <= 0.27 and 0.49 <= l_h <= 0.53:
                    return "Mesomorph"
                return "Endomorph"

            measurements["classifications"] = {
                "shape_type": get_shape(shp, whr),
                "somatotype": get_soma(s_px, h_px, l_px, whr),
            }
        except Exception:
            measurements["classifications"] = {}

        return measurements
    except Exception as e:
        print(f"Lỗi phân tích: {e}")
        return measurements


def draw_measurements_on_image(image, measurements, landmarks_px):
    """Vẽ các đường đo lên ảnh."""
    annotated_img = image.copy()

    draw_pts = measurements.get("draw_points", {})
    colors = {
        "shoulder": (255, 0, 0),  # Đỏ
        "hip": (0, 255, 0),  # Xanh lá
        "waist": (0, 255, 255),  # Vàng
        "leg": (255, 0, 255),  # Tím
    }

    for key, color in colors.items():
        if key in draw_pts:
            pts = draw_pts[key]
            cv2.line(
                annotated_img,
                (int(pts[0][0]), int(pts[0][1])),
                (int(pts[1][0]), int(pts[1][1])),
                color,
                3,
            )
            if key in ["shoulder", "hip", "waist"]:
                cv2.circle(
                    annotated_img, (int(pts[0][0]), int(pts[0][1])), 6, color, -1
                )
                cv2.circle(
                    annotated_img, (int(pts[1][0]), int(pts[1][1])), 6, color, -1
                )

    return annotated_img


def analyze_pose_with_model(pose_model, image, known_height_cm=None):
    """
    Phân tích ảnh bằng MediaPipe PoseLandmarker (Tasks API).
    """
    height, width = image.shape[:2]

    # Chuyển sang RGB và tạo MediaPipe Image
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

    # Detect
    result = pose_model.detect(mp_image)

    if not result.pose_landmarks or len(result.pose_landmarks) == 0:
        return None, None, None

    # Lấy landmarks của người đầu tiên, chuyển sang pixel
    pose_lms = result.pose_landmarks[0]  # list of NormalizedLandmark
    landmarks_px = [
        (
            lm.x * width,
            lm.y * height,
            lm.visibility if hasattr(lm, "visibility") else 0.9,
        )
        for lm in pose_lms
    ]

    # Tính số đo
    measurements = _calculate_measurements_from_landmarks(
        landmarks_px,
        width,
        height,
        segmentation_mask=result.segmentation_masks[0]
        if result.segmentation_masks
        else None,
        known_height_cm=known_height_cm,
    )

    # Vẽ ảnh
    annotated_image = draw_measurements_on_image(image, measurements, landmarks_px)

    # Overlay segmentation mask (nếu có)
    if result.segmentation_masks:
        seg_mask = result.segmentation_masks[0].numpy_view()
        condition = np.stack((seg_mask,) * 3, axis=-1) > 0.3
        bg_image = np.zeros(image.shape, dtype=np.uint8)
        bg_image[:] = (200, 150, 50)
        annotated_image = np.where(
            condition,
            cv2.addWeighted(annotated_image, 0.7, bg_image, 0.3, 0),
            annotated_image,
        )

    ratio = None
    if measurements["confidence_flags"].get("shoulder_hip_ratio"):
        ratio = measurements["pixel_measurements"]["shoulder_hip_ratio"]

    return annotated_image, ratio, measurements
