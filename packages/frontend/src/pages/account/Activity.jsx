import React, { useState } from "react";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Activity() {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  // Mock data for activity history
  const activities = [
    {
      id: 1,
      type: 'login',
      description: 'Đăng nhập thành công',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'success'
    },
    {
      id: 2,
      type: 'password_change',
      description: 'Thay đổi mật khẩu',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'success'
    },
    {
      id: 3,
      type: 'profile_update',
      description: 'Cập nhật thông tin cá nhân',
      device: 'Chrome trên Windows',
      location: 'Hà Nội, Việt Nam',
      ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'success'
    },
    {
      id: 4,
      type: 'failed_login',
      description: 'Đăng nhập thất bại',
      device: 'Safari trên iPhone',
      location: 'TP.HCM, Việt Nam',
      ip: '203.162.235.1',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'failed'
    },
    {
      id: 5,
      type: 'login',
      description: 'Đăng nhập thành công',
      device: 'Chrome trên Android',
      location: 'Đà Nẵng, Việt Nam',
      ip: '192.168.1.2',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'success'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Không xác định';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'login':
        return '🔐';
      case 'password_change':
        return '🔑';
      case 'profile_update':
        return '👤';
      case 'failed_login':
        return '❌';
      default:
        return '📝';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'success') return activity.status === 'success';
    if (filter === 'failed') return activity.status === 'failed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử hoạt động</h1>
            <p className="text-gray-600">Theo dõi các hoạt động gần đây trên tài khoản của bạn</p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hoạt động
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="success">Thành công</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng thời gian
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="90days">90 ngày qua</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-200">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {getTypeIcon(activity.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.device} • {activity.location}
                          </p>
                          <p className="text-xs text-gray-400">
                            IP: {activity.ip}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusText(activity.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có hoạt động nào</h3>
                <p className="text-gray-600">Không tìm thấy hoạt động nào trong khoảng thời gian đã chọn.</p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Hiển thị {filteredActivities.length} hoạt động
              </p>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50">
                Xuất dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
