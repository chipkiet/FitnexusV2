# config.py

# --- Cấu hình đường dẫn ---
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
DATA_FOLDER = "data"
EXERCISE_DATABASE_FILE = "exercises.json"

# --- Cấu hình MediaPipe ---
# Ngưỡng tin cậy tối thiểu để coi một điểm mốc là hợp lệ.
# Giá trị từ 0.0 đến 1.0. Tăng lên nếu muốn AI chặt chẽ hơn về chất lượng ảnh.
VISIBILITY_THRESHOLD = 0.65

# --- Cấu hình ngưỡng phân tích vóc dáng ---
# Các ngưỡng này được dùng để xác định hồ sơ vóc dáng của người dùng.
# Bạn có thể tinh chỉnh các con số này sau khi thử nghiệm với nhiều ảnh.

# Tỷ lệ vai/hông (Ngang)
SHOULDER_HIP_RATIO_THRESHOLDS = {
    "NARROW_SHOULDERS": 1.05,  # Dưới ngưỡng này => Vai hẹp (Dáng quả lê)
    "WIDE_SHOULDERS": 1.35     # Trên ngưỡng này => Vai rộng (Dáng tam giác ngược)
    # Giữa hai ngưỡng này là Dáng cân đối (Chữ nhật)
}

# Tỷ lệ chân/lưng (Dọc)
LEG_TORSO_RATIO_THRESHOLDS = {
    "SHORT_LEGS": 0.9,  # Dưới ngưỡng này => Lưng dài, chân ngắn
    "LONG_LEGS": 1.1    # Trên ngưỡng này => Lưng ngắn, chân dài
    # Giữa hai ngưỡng này là Tỷ lệ cân đối
}

# --- NGƯỠNG MỚI ĐỂ PHÁT HIỆN TRƯỜNG HỢP ĐẶC BIỆT ---
# Nếu một trong hai chỉ số này bị vượt qua, AI sẽ chuyển sang chế độ phân tích Endomorph
ENDOMORPH_DETECTION_THRESHOLDS = {
    "ABNORMAL_SHOULDER_HIP_RATIO": 1.45, # Tỷ lệ xương vai/hông cao bất thường
    "ABNORMAL_LEG_TORSO_RATIO": 1.4    # Tỷ lệ chân/lưng cao bất thường (dấu hiệu hông bị đo sai)
}