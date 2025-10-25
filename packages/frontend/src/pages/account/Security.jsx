import React, { useState } from "react";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Security() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 30,
    deviceManagement: true,
  });

  const handleToggle = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSessionTimeoutChange = (e) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessionTimeout: parseInt(e.target.value)
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement API call to save security settings
    console.log("Saving security settings:", securitySettings);
    alert("Cài đặt bảo mật đã được lưu!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Bảo mật</h1>
            <p className="text-gray-600">Quản lý các cài đặt bảo mật cho tài khoản của bạn</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Two-Factor Authentication */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác thực hai yếu tố</h3>
                  <p className="text-gray-600">Thêm một lớp bảo mật bổ sung cho tài khoản của bạn</p>
                </div>
                <button
                  onClick={() => handleToggle('twoFactorAuth')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {securitySettings.twoFactorAuth && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Xác thực hai yếu tố đã được kích hoạt. Bạn sẽ cần nhập mã xác thực từ ứng dụng di động khi đăng nhập.
                  </p>
                </div>
              )}
            </div>

            {/* Login Notifications */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Thông báo đăng nhập</h3>
                  <p className="text-gray-600">Nhận thông báo khi có đăng nhập mới vào tài khoản</p>
                </div>
                <button
                  onClick={() => handleToggle('loginNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Suspicious Activity Alerts */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cảnh báo hoạt động đáng ngờ</h3>
                  <p className="text-gray-600">Nhận cảnh báo khi phát hiện hoạt động bất thường</p>
                </div>
                <button
                  onClick={() => handleToggle('suspiciousActivityAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.suspiciousActivityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.suspiciousActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Session Timeout */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thời gian hết phiên</h3>
                <p className="text-gray-600">Tự động đăng xuất sau một khoảng thời gian không hoạt động</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian (phút)
                </label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={handleSessionTimeoutChange}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={120}>2 giờ</option>
                  <option value={0}>Không giới hạn</option>
                </select>
              </div>
            </div>

            {/* Device Management */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quản lý thiết bị</h3>
                  <p className="text-gray-600">Xem và quản lý các thiết bị đã đăng nhập</p>
                </div>
                <button
                  onClick={() => handleToggle('deviceManagement')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.deviceManagement ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.deviceManagement ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {securitySettings.deviceManagement && (
                <div className="mt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Xem danh sách thiết bị →
                  </button>
                </div>
              )}
            </div>

            {/* Recent Security Events */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sự kiện bảo mật gần đây</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Đăng nhập thành công</p>
                    <p className="text-sm text-gray-600">Từ Chrome trên Windows • Hôm nay 14:30</p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Thành công</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Thay đổi mật khẩu</p>
                    <p className="text-sm text-gray-600">Hôm qua 09:15</p>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Thành công</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
