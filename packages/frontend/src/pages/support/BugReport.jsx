import React, { useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function BugReport() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    steps: "",
    expectedResult: "",
    actualResult: "",
    severity: "medium",
    category: "",
    browser: "",
    os: "",
    device: "",
    screenshots: null,
    additionalInfo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const severityLevels = [
    { value: "low", label: "Thấp", description: "Lỗi nhỏ, không ảnh hưởng nhiều đến trải nghiệm" },
    { value: "medium", label: "Trung bình", description: "Lỗi có thể ảnh hưởng đến một số tính năng" },
    { value: "high", label: "Cao", description: "Lỗi nghiêm trọng, ảnh hưởng đến việc sử dụng" },
    { value: "critical", label: "Nghiêm trọng", description: "Lỗi khiến ứng dụng không thể sử dụng được" }
  ];

  const categories = [
    { value: "ui", label: "Giao diện người dùng" },
    { value: "functionality", label: "Tính năng" },
    { value: "performance", label: "Hiệu suất" },
    { value: "login", label: "Đăng nhập/Đăng ký" },
    { value: "workout", label: "Tập luyện" },
    { value: "data", label: "Dữ liệu" },
    { value: "mobile", label: "Ứng dụng di động" },
    { value: "other", label: "Khác" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Chỉ được đính kèm tối đa 5 file");
      return;
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024); // 5MB
    if (oversizedFiles.length > 0) {
      alert("Một số file có kích thước vượt quá 5MB");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      screenshots: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit bug report
      console.log("Submitting bug report:", formData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert("Báo lỗi đã được gửi thành công! Cảm ơn bạn đã giúp cải thiện ứng dụng.");
      setFormData({
        title: "",
        description: "",
        steps: "",
        expectedResult: "",
        actualResult: "",
        severity: "medium",
        category: "",
        browser: "",
        os: "",
        device: "",
        screenshots: null,
        additionalInfo: ""
      });
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Có lỗi xảy ra khi gửi báo lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Báo lỗi</h1>
          <p className="text-lg text-gray-600">Giúp chúng tôi cải thiện ứng dụng bằng cách báo cáo lỗi</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề lỗi *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả ngắn gọn về lỗi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả chi tiết về lỗi bạn gặp phải..."
                  />
                </div>
              </div>
            </div>

            {/* Bug Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết lỗi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Các bước để tái tạo lỗi *
                  </label>
                  <textarea
                    name="steps"
                    value={formData.steps}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1. Bước đầu tiên...&#10;2. Bước thứ hai...&#10;3. Bước thứ ba..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kết quả mong đợi
                    </label>
                    <textarea
                      name="expectedResult"
                      value={formData.expectedResult}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kết quả bạn mong đợi..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kết quả thực tế
                    </label>
                    <textarea
                      name="actualResult"
                      value={formData.actualResult}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kết quả thực tế xảy ra..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân loại</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ nghiêm trọng *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {severityLevels.find(s => s.value === formData.severity)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Môi trường</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trình duyệt
                  </label>
                  <input
                    type="text"
                    name="browser"
                    value={formData.browser}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chrome 120, Firefox 119..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hệ điều hành
                  </label>
                  <input
                    type="text"
                    name="os"
                    value={formData.os}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Windows 11, macOS 14..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thiết bị
                  </label>
                  <input
                    type="text"
                    name="device"
                    value={formData.device}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Desktop, iPhone 15, Samsung Galaxy..."
                  />
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh minh họa</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đính kèm ảnh chụp màn hình
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, PNG (tối đa 5 file, mỗi file 5MB)
                </p>
                {formData.screenshots && formData.screenshots.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Đã chọn {formData.screenshots.length} file(s)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin bổ sung
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bất kỳ thông tin nào khác có thể hữu ích..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo lỗi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
