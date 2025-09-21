# main.py

import os
import argparse
from datetime import datetime
import cv2
from typing import Dict, Any

from core.pose_estimator import process_image, draw_landmarks_on_image
from core.feature_extractor import extract_all_features
from core.recommender import get_body_profile_and_recommendations
import config

def print_photo_guidelines():
    """In ra màn hình hướng dẫn chụp ảnh đúng cách."""
    print("\n--- HƯỚNG DẪN CHỤP ẢNH ĐỂ CÓ KẾT QUẢ TỐT NHẤT ---")
    print("1. TOÀN THÂN: Ảnh phải thấy rõ từ lòng bàn chân đến đỉnh đầu.")
    print("2. CHÍNH DIỆN: Đứng thẳng, đối diện trực tiếp với máy ảnh.")
    print("3. TRANG PHỤC: Mặc đồ ôm sát, gọn gàng (đồ tập gym là tốt nhất).")
    print("4. TƯ THẾ: Đứng thẳng tự nhiên, hai tay duỗi thẳng hai bên, chân rộng bằng vai.")
    print("5. GÓC MÁY: Đặt máy ảnh ngang tầm ngực hoặc bụng, không chụp từ trên xuống/dưới lên.")
    print("6. PHÔNG NỀN: Đứng trước một bức tường trơn, một màu.")
    print("7. ÁNH SÁNG & NÉT: Ảnh cần đủ sáng và rõ nét.")
    print("-----------------------------------------------------")

def _print_report(results: Dict[str, Any]):
    """In báo cáo phân tích ra màn hình với định dạng chuyên nghiệp."""
    print("\n" + "="*50)
    print("BÁO CÁO PHÂN TÍCH VÓC DÁNG (ƯỚC TÍNH)")
    print("="*50)

    print("\n[+] CÁC CHỈ SỐ CHÍNH:")
    for key, value in results["metrics"].items():
        print(f"  - {key}: {value}")

    print("\n[+] HỒ SƠ VÓC DÁNG & PHÂN TÍCH:")
    print(f"  - Hồ sơ chính: {results['body_profile']}")
    if results['vertical_analysis']:
        print(f"  - Phân tích dọc: {results['vertical_analysis']}")
    print(f"  - Phân tích tư thế: {results['posture_analysis']}")

    recs = results["recommendations"]
    print("\n[+] CHIẾN LƯỢ̣c TẬP LUYỆN GỢI Ý:")
    print(f"  {results['strategy']}")
    
    print("\n  --- BÀI TẬP TẬP TRUNG ---")
    if recs['focus_exercises']:
        for ex in recs['focus_exercises'][:5]:
            print(f"    - {ex['exercise_name']} ({ex['difficulty']})")
    else:
        print("    (Không có bài tập phù hợp)")
        
    if recs['secondary_exercises']:
        print("\n  --- BÀI TẬP BỔ TRỢ ---")
        for ex in recs['secondary_exercises'][:3]:
            print(f"    - {ex['exercise_name']} ({ex['difficulty']})")
    
    print("\n" + "-"*50)
    print("LƯU Ý QUAN TRỌNG:")
    print("Các phân tích và gợi ý trên hoàn toàn dựa vào thuật toán máy tính và chỉ mang tính chất tham khảo. Luôn tham khảo ý kiến của huấn luyện viên chuyên nghiệp để có một chương trình tập luyện an toàn và hiệu quả nhất.")
    print("="*50)

def run_analysis(image_path: str):
    """Hàm chính chạy toàn bộ quy trình."""
    if not os.path.exists(image_path):
        print(f"Lỗi: Không tìm thấy tệp '{image_path}'")
        return

    print(f"Đang xử lý hình ảnh: {os.path.basename(image_path)}...")
    image, pose_results = process_image(image_path)
    
    body_features = extract_all_features(pose_results)
    if body_features.get("error"):
        print(f"\n[LỖI PHÂN TÍCH] {body_features['error']}")
        print_photo_guidelines()
        return

    analysis_results = get_body_profile_and_recommendations(body_features)
    if analysis_results.get("error"):
        print(f"\n[LỖI GỢI Ý] {analysis_results['error']}")
        return

    _print_report(analysis_results)
    
    annotated_image = draw_landmarks_on_image(image, pose_results)
    
    # Thêm chú thích giải thích vào hình ảnh
    text = "NOTE: Lines show the estimated skeleton, not the body outline."
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    color = (0, 0, 255)  # Màu đỏ (BGR)
    thickness = 1
    (h, w) = annotated_image.shape[:2]
    position = (10, h - 15)
    cv2.putText(annotated_image, text, position, font, font_scale, color, thickness, cv2.LINE_AA)
    
    # Lưu ảnh
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"result_{os.path.basename(image_path).split('.')[0]}_{timestamp}.jpg"
    output_path = os.path.join(config.OUTPUT_FOLDER, output_filename)
    os.makedirs(config.OUTPUT_FOLDER, exist_ok=True)
    cv2.imwrite(output_path, annotated_image)
    print(f"\nĐã lưu hình ảnh phân tích tại: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Gym Trainer - Phân tích vóc dáng và gợi ý bài tập.")
    parser.add_argument("image_path", type=str, help="Đường dẫn đến tệp hình ảnh cần phân tích.")
    args = parser.parse_args()
    run_analysis(args.image_path)