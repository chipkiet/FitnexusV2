import React, { useState } from "react";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Theme() {
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const themes = [
    { value: "light", label: "Sáng", description: "Giao diện sáng, dễ nhìn trong điều kiện ánh sáng tốt" },
    { value: "dark", label: "Tối", description: "Giao diện tối, tiết kiệm pin và dễ nhìn trong môi trường tối" },
    { value: "system", label: "Theo hệ thống", description: "Tự động theo cài đặt của thiết bị" }
  ];

  const accentColors = [
    { value: "blue", label: "Xanh dương", color: "bg-blue-500" },
    { value: "green", label: "Xanh lá", color: "bg-green-500" },
    { value: "purple", label: "Tím", color: "bg-purple-500" },
    { value: "red", label: "Đỏ", color: "bg-red-500" },
    { value: "orange", label: "Cam", color: "bg-orange-500" },
    { value: "pink", label: "Hồng", color: "bg-pink-500" },
    { value: "indigo", label: "Chàm", color: "bg-indigo-500" },
    { value: "teal", label: "Xanh ngọc", color: "bg-teal-500" }
  ];

  const fontSizes = [
    { value: "small", label: "Nhỏ", description: "Tiết kiệm không gian, phù hợp màn hình nhỏ" },
    { value: "medium", label: "Trung bình", description: "Kích thước mặc định, dễ đọc" },
    { value: "large", label: "Lớn", description: "Dễ đọc hơn, phù hợp người có vấn đề về thị lực" },
    { value: "extra-large", label: "Rất lớn", description: "Kích thước lớn nhất, dễ đọc nhất" }
  ];

  const handleSave = () => {
    // TODO: Implement API call to save theme settings
    console.log("Saving theme settings:", {
      theme,
      accentColor,
      fontSize,
      reducedMotion,
      highContrast
    });
    alert("Cài đặt giao diện đã được lưu!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt giao diện</h1>
          <p className="text-gray-600">Tùy chỉnh giao diện và trải nghiệm người dùng</p>
        </div>

        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chế độ hiển thị</h3>
            <p className="text-sm text-gray-600 mb-4">Chọn chế độ sáng hoặc tối cho ứng dụng</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map(themeOption => (
                <label
                  key={themeOption.value}
                  className={`relative cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                    theme === themeOption.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption.value}
                    checked={theme === themeOption.value}
                    onChange={(e) => setTheme(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-lg ${
                      themeOption.value === 'light' ? 'bg-gray-100' :
                      themeOption.value === 'dark' ? 'bg-gray-800' :
                      'bg-gradient-to-br from-gray-100 to-gray-800'
                    }`}>
                      {themeOption.value === 'system' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{themeOption.label}</h4>
                    <p className="text-xs text-gray-600 mt-1">{themeOption.description}</p>
                  </div>
                  {theme === themeOption.value && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Màu nhấn</h3>
            <p className="text-sm text-gray-600 mb-4">Chọn màu chủ đạo cho giao diện</p>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {accentColors.map(color => (
                <label
                  key={color.value}
                  className={`relative cursor-pointer group ${
                    accentColor === color.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="accentColor"
                    value={color.value}
                    checked={accentColor === color.value}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-12 ${color.color} rounded-lg shadow-sm group-hover:shadow-md transition-shadow`}>
                    {accentColor === color.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-700">{color.label}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kích thước chữ</h3>
            <p className="text-sm text-gray-600 mb-4">Điều chỉnh kích thước chữ cho dễ đọc</p>
            
            <div className="space-y-3">
              {fontSizes.map(size => (
                <label
                  key={size.value}
                  className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    fontSize === size.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={size.value}
                    checked={fontSize === size.value}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{size.label}</p>
                    <p className="text-sm text-gray-600">{size.description}</p>
                  </div>
                  <div className={`text-gray-900 ${
                    size.value === 'small' ? 'text-sm' :
                    size.value === 'medium' ? 'text-base' :
                    size.value === 'large' ? 'text-lg' :
                    'text-xl'
                  }`}>
                    Aa
                  </div>
                  {fontSize === size.value && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn trợ năng</h3>
            <p className="text-sm text-gray-600 mb-4">Cài đặt để cải thiện khả năng tiếp cận</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Giảm chuyển động</p>
                  <p className="text-sm text-gray-600">Tắt hiệu ứng chuyển động và animation</p>
                </div>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Độ tương phản cao</p>
                  <p className="text-sm text-gray-600">Tăng độ tương phản để dễ nhìn hơn</p>
                </div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 ${accentColors.find(c => c.value === accentColor)?.color} rounded-full`}></div>
                <div>
                  <p className="font-medium text-gray-900">Tên người dùng</p>
                  <p className="text-sm text-gray-600">Ví dụ về giao diện</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className={`h-2 ${accentColors.find(c => c.value === accentColor)?.color} rounded`} style={{width: '60%'}}></div>
                <div className={`h-2 ${accentColors.find(c => c.value === accentColor)?.color} rounded`} style={{width: '40%'}}></div>
                <div className={`h-2 ${accentColors.find(c => c.value === accentColor)?.color} rounded`} style={{width: '80%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Đây là ví dụ về cách giao diện sẽ trông với cài đặt hiện tại của bạn.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
