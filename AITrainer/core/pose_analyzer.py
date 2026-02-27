# core/pose_analyzer.py
import cv2
import numpy as np
import mediapipe as mp

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

def load_pose_model():
    """Tạo đối tượng MediaPipe Pose."""
    print("Khởi tạo mô hình MediaPipe Pose...")
    # Khởi tạo một phiên bản Pose tĩnh cho ảnh (static_image_mode = True)
    return mp_pose.Pose(
        static_image_mode=True, 
        model_complexity=2, # Độ chính xác cao nhất
        enable_segmentation=True, # Bật mask để có thể bắt sát rìa cơ thể hơn
        min_detection_confidence=0.5
    )

def _euclidean_distance(p1, p2): 
    return np.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def _calculate_measurements_from_landmarks(landmarks, image_width, image_height, segmentation_mask=None, known_height_cm=None):
    """
    Tính toán số đo cơ thể từ 33 Keypoints của MediaPipe Pose Landmarks.
    """
    measurements = {
        "pixel_measurements": {},
        "cm_measurements": {},
        "scale_cm_per_px": None,
        "confidence_flags": {}
    }

    try:
        # Lấy toạ độ các điểm chính (nhân với width, height để ra pixel thật)
        def get_pt(idx):
            lm = landmarks.landmark[idx]
            return (lm.x * image_width, lm.y * image_height, lm.visibility)

        # 11: Left Shoulder, 12: Right Shoulder
        ls_x, ls_y, ls_conf = get_pt(mp_pose.PoseLandmark.LEFT_SHOULDER)
        rs_x, rs_y, rs_conf = get_pt(mp_pose.PoseLandmark.RIGHT_SHOULDER)
        
        # 23: Left Hip, 24: Right Hip
        lh_x, lh_y, lh_conf = get_pt(mp_pose.PoseLandmark.LEFT_HIP)
        rh_x, rh_y, rh_conf = get_pt(mp_pose.PoseLandmark.RIGHT_HIP)

        # 27: Left Ankle, 28: Right Ankle
        la_x, la_y, la_conf = get_pt(mp_pose.PoseLandmark.LEFT_ANKLE)
        ra_x, ra_y, ra_conf = get_pt(mp_pose.PoseLandmark.RIGHT_ANKLE)

        # 0: Nose
        nose_x, nose_y, nose_conf = get_pt(mp_pose.PoseLandmark.NOSE)

        # Lấy thêm tọa độ khuỷu tay/đầu gối để làm hệ tham chiếu cho độ dày cơ thể
        left_elbow_x = get_pt(mp_pose.PoseLandmark.LEFT_ELBOW)[0]
        right_elbow_x = get_pt(mp_pose.PoseLandmark.RIGHT_ELBOW)[0]
        
        # 1. Shoulder width (Đo từ mép ngoài bắp tay)
        if min(ls_conf, rs_conf) >= 0.5:
            # MediaPipe khớp vai nằm tít tắp trong xương đòn, ta cần nới rộng ra sát bắp tay ngoài
            # Ta dùng khoảng cách từ tâm người ra khuỷu tay làm trần, hoặc nới rộng 20-30%
            inner_shoulder_width = abs(ls_x - rs_x)
            
            # Ước tính phần bắp tay (deltoid) dư ra ngoài dựa trên tỷ lệ vai
            # Nhân hệ số 1.3 sẽ khá sát viền áo phông/bắp tay ngoài
            shoulder_width_px = inner_shoulder_width * 1.3
            
            # Tính điểm trái/phải thực tế để vẽ (bung đều từ tâm)
            cx, cy = (ls_x + rs_x) / 2, (ls_y + rs_y) / 2
            draw_ls_x = cx + (ls_x - cx) * 1.3
            draw_rs_x = cx + (rs_x - cx) * 1.3
            
            measurements["pixel_measurements"]["shoulder_width"] = float(shoulder_width_px)
            measurements["confidence_flags"]["shoulder_width"] = True
            measurements["draw_points"] = {"shoulder": ((draw_ls_x, ls_y), (draw_rs_x, rs_y))}
        else:
            measurements["confidence_flags"]["shoulder_width"] = False

        # 2. Hip width
        if min(lh_conf, rh_conf) >= 0.5:
            inner_hip_width = abs(lh_x - rh_x)
            # Khớp háng/đùi của MP nằm sâu bên trong, viền ngoài hông thường rộng hơn 35-40%
            hip_width_px = inner_hip_width * 1.38
            
            cx, cy = (lh_x + rh_x) / 2, (lh_y + rh_y) / 2
            draw_lh_x = cx + (lh_x - cx) * 1.38
            draw_rh_x = cx + (rh_x - cx) * 1.38
            
            measurements["pixel_measurements"]["hip_width"] = float(hip_width_px)
            measurements["confidence_flags"]["hip_width"] = True
            measurements["draw_points"] = measurements.get("draw_points", {})
            measurements["draw_points"]["hip"] = ((draw_lh_x, lh_y), (draw_rh_x, rh_y))
        else:
            measurements["confidence_flags"]["hip_width"] = False

        # 3. Waist width (Nội suy 45% từ hông lên vai)
        if min(ls_conf, rs_conf, lh_conf, rh_conf) >= 0.5:
            waist_ratio = 0.45 
            lw_x = lh_x + waist_ratio * (ls_x - lh_x)
            lw_y = lh_y + waist_ratio * (ls_y - lh_y)
            rw_x = rh_x + waist_ratio * (rs_x - rh_x)
            rw_y = rh_y + waist_ratio * (rs_y - rh_y)
            
            # Eo thường ít mỡ/thịt dư bọc ngoài hơn Vai/Hông, nới rộng 25% (1.25)
            inner_waist_width = abs(lw_x - rw_x)
            waist_width_px = inner_waist_width * 1.25
            
            cx, cy = (lw_x + rw_x) / 2, (lw_y + rw_y) / 2
            draw_lw_x = cx + (lw_x - cx) * 1.25
            draw_rw_x = cx + (rw_x - cx) * 1.25
            
            measurements["pixel_measurements"]["waist_width"] = float(waist_width_px)
            measurements["confidence_flags"]["waist_width"] = True
            measurements["draw_points"]["waist"] = ((draw_lw_x, lw_y), (draw_rw_x, rw_y))
        else:
            measurements["confidence_flags"]["waist_width"] = False

        # 4. Height (Từ mũi / mỏm đầu mút đến gót chân thấp nhất)
        valid_ys = [lm.y * image_height for lm in landmarks.landmark if lm.visibility > 0.5]
        if len(valid_ys) > 5:
            min_y = min(valid_ys)
            # Thêm khoáng cách từ mắt/mũi lên đỉnh đầu (xấp xỉ 10% chiều cao mặt)
            if nose_conf > 0.5:
                # Ước lượng đỉnh đầu cao hơn mũi chút đỉnh
                min_y = nose_y - abs(ls_x - rs_x)*0.4 

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
            measurements["draw_points"]["leg"] = (
                ((lh_x + rh_x)/2, mid_hip_y),
                ((la_x + ra_x)/2, mid_ankle_y)
            )
        else:
            measurements["confidence_flags"]["leg_length"] = False

        # 6. Ratios
        if measurements["confidence_flags"].get("shoulder_width") and measurements["confidence_flags"].get("hip_width"):
            ratio = measurements["pixel_measurements"]["shoulder_width"] / measurements["pixel_measurements"]["hip_width"]
            measurements["pixel_measurements"]["shoulder_hip_ratio"] = float(ratio)
            
        if measurements["confidence_flags"].get("waist_width") and measurements["confidence_flags"].get("hip_width"):
            whr = measurements["pixel_measurements"]["waist_width"] / measurements["pixel_measurements"]["hip_width"]
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
                if not s_h_r or not w_h_r: return None
                if s_h_r > 1.15 and w_h_r < 0.9: return "Inverted Triangle"
                if s_h_r < 0.9 and w_h_r >= 0.9: return "Triangle"
                if abs(s_h_r - 1.0) <= 0.1 and 0.9 <= w_h_r <= 1.05: return "Rectangle"
                return "Hourglass" if w_h_r < 0.85 else "Rectangle"
                
            def get_soma(s, h, l, w_h_r):
                if not h: return None
                s_h = s/h
                l_h = l/h
                if s_h < 0.23 and l_h > 0.53: return "Ectomorph"
                if 0.23 <= s_h <= 0.27 and 0.49 <= l_h <= 0.53: return "Mesomorph"
                return "Endomorph"

            measurements["classifications"] = {
                "shape_type": get_shape(shp, whr),
                "somatotype": get_soma(s_px, h_px, l_px, whr),
            }
        except:
             measurements["classifications"] = {}

        return measurements
    except Exception as e:
        print(f"Lỗi phân tích: {e}")
        return measurements

def draw_measurements_on_image(image, measurements, landmarks):
    annotated_img = image.copy()
    
    # 1. Vẽ bộ xương chuẩn 33 điểm của MediaPipe mờ nhẹ làm nền
    if landmarks:
        mp_drawing.draw_landmarks(
            annotated_img,
            landmarks,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=1, circle_radius=1),
            connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=1)
        )

    # 2. Vẽ đè các đường kích thước ngang đã mở rộng
    draw_pts = measurements.get("draw_points", {})
    
    colors = {
        "shoulder": (255, 0, 0), # Đỏ
        "hip": (0, 255, 0),      # Xanh
        "waist": (0, 255, 255),  # Vàng
        "leg": (255, 0, 255)     # Tím
    }
    
    for key, color in colors.items():
        if key in draw_pts:
            pts = draw_pts[key]
            # Điểm lưu ở _calculate_measurements_from_landmarks đã được nhân margin rỗng rãi
            cv2.line(annotated_img, (int(pts[0][0]), int(pts[0][1])), (int(pts[1][0]), int(pts[1][1])), color, 3)
            # Đối với đường ngang (Vai, Eo, Hông) Vẽ thêm cục chấm tròn bự ở đầu mép
            if key in ["shoulder", "hip", "waist"]:
                 cv2.circle(annotated_img, (int(pts[0][0]), int(pts[0][1])), 6, color, -1)
                 cv2.circle(annotated_img, (int(pts[1][0]), int(pts[1][1])), 6, color, -1)

    return annotated_img

def analyze_pose_with_model(pose_model, image, known_height_cm=None):
    """
    Phân tích ảnh bằng MediaPipe Holistic/Pose thay cho YOLO.
    """
    # MediaPipe yêu cầu ảnh RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process
    results = pose_model.process(image_rgb)
    
    if not results.pose_landmarks:
        return None, None, None

    height, width, _ = image.shape
    
    # Tính số đo
    measurements = _calculate_measurements_from_landmarks(
        results.pose_landmarks, 
        width, height, 
        segmentation_mask=results.segmentation_mask, # Dành riêng cho mở rộng trong tương lai
        known_height_cm=known_height_cm
    )
    
    # Vẽ ảnh
    annotated_image = draw_measurements_on_image(image, measurements, results.pose_landmarks)
    
    # Overlay hình bóng Mask (phần thịt thật sự) mờ mờ màu xanh biển (nếu MediaPipe quét được)
    if results.segmentation_mask is not None:
        condition = np.stack((results.segmentation_mask,) * 3, axis=-1) > 0.3
        bg_image = np.zeros(image.shape, dtype=np.uint8)
        bg_image[:] = (200, 150, 50) # Màu xanh ánh kim
        annotated_image = np.where(condition, cv2.addWeighted(annotated_image, 0.7, bg_image, 0.3, 0), annotated_image)

    ratio = None
    if measurements["confidence_flags"].get("shoulder_hip_ratio"):
         ratio = measurements["pixel_measurements"]["shoulder_hip_ratio"]

    return annotated_image, ratio, measurements
