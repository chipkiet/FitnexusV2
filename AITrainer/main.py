# main.py
import os
import argparse
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Import các module từ thư mục core
from core.pose_analyzer import load_yolo_model, analyze_pose_with_yolo
from core.gemini_client import get_gemini_recommendations
# from core.image_utils import draw_text_with_pillow # Nếu bạn muốn giữ hàm vẽ text ở file riêng

def main():
    """Hàm chính để chạy toàn bộ quy trình."""
    parser = argparse.ArgumentParser(description="AI Gym Trainer sử dụng YOLOv8 và Gemini API.")
    parser.add_argument("image_path", type=str, help="Đường dẫn đến tệp hình ảnh cần phân tích.")
    args = parser.parse_args()

    # --- Bước 1: Tải mô hình ---
    yolo_model = load_yolo_model()
    if yolo_model is None:
        return

    # --- Bước 2: Đọc và xử lý ảnh ---
    if not os.path.exists(args.image_path):
        print(f"Lỗi: Không tìm thấy ảnh tại '{args.image_path}'")
        return
        
    image = cv2.imread(args.image_path)
    if image is None:
        print(f"Lỗi: Không thể đọc file ảnh '{args.image_path}'")
        return

    print(f"Đang xử lý ảnh: {args.image_path}")
    annotated_image, ratio = analyze_pose_with_yolo(yolo_model, image)

    if ratio is None or annotated_image is None:
        print("\nKhông thể phát hiện người hoặc tính toán tỷ lệ từ ảnh. Vui lòng thử ảnh khác rõ ràng hơn.")
        return

    # --- Bước 3: Gọi Gemini API để lấy gợi ý ---
    recommendations = get_gemini_recommendations(ratio)
    
    print("\n--- GỢI Ý TỪ GEMINI AI ---")
    print(recommendations)
    print("-------------------------\n")

    # --- Bước 4: Hiển thị kết quả và lưu ảnh ---
    # Ghi tỷ lệ đã tính được lên ảnh
    ratio_text = f"Shoulder-Hip Ratio: {ratio:.2f}"
    
    # Sử dụng Pillow để vẽ text đẹp hơn
    final_image = annotated_image.copy()
    try:
        pil_img = Image.fromarray(cv2.cvtColor(final_image, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_img)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except IOError:
            font = ImageFont.load_default()
        draw.text((10, 10), ratio_text, font=font, fill=(255, 153, 51)) # Màu cam
        final_image = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print(f"Không thể vẽ text bằng Pillow, sử dụng OpenCV fallback. Lỗi: {e}")
        cv2.putText(final_image, ratio_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (51, 153, 255), 2)


    # Tạo tên file output và lưu
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    base_filename = os.path.basename(args.image_path)
    output_path = os.path.join(output_dir, f"result_{base_filename}")

    cv2.imwrite(output_path, final_image)
    print(f"Đã lưu ảnh kết quả tại: {output_path}")
    
    # Hiển thị ảnh kết quả
    cv2.imshow("AI Gym Trainer Result", final_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()