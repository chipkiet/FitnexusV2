import React, { useState } from "react";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Guide() {
  const [selectedCategory, setSelectedCategory] = useState("getting-started");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { value: "getting-started", label: "Bắt đầu", icon: "🚀" },
    { value: "workout", label: "Tập luyện", icon: "💪" },
    { value: "nutrition", label: "Dinh dưỡng", icon: "🥗" },
    { value: "profile", label: "Hồ sơ", icon: "👤" },
    { value: "settings", label: "Cài đặt", icon: "⚙️" },
    { value: "troubleshooting", label: "Khắc phục sự cố", icon: "🔧" }
  ];

  const guides = {
    "getting-started": [
      {
        title: "Tạo tài khoản và đăng nhập",
        content: "Hướng dẫn tạo tài khoản mới và đăng nhập vào ứng dụng FitNexus.",
        steps: [
          "Truy cập trang đăng ký",
          "Điền thông tin cá nhân",
          "Xác thực email",
          "Đăng nhập lần đầu"
        ]
      },
      {
        title: "Khám phá giao diện chính",
        content: "Làm quen với các thành phần chính của ứng dụng.",
        steps: [
          "Thanh điều hướng",
          "Menu người dùng",
          "Các tính năng chính",
          "Cài đặt nhanh"
        ]
      },
      {
        title: "Thiết lập hồ sơ ban đầu",
        content: "Cập nhật thông tin cá nhân và mục tiêu fitness.",
        steps: [
          "Thông tin cơ bản",
          "Mục tiêu fitness",
          "Sở thích tập luyện",
          "Lưu hồ sơ"
        ]
      }
    ],
    "workout": [
      {
        title: "Tạo kế hoạch tập luyện",
        content: "Hướng dẫn tạo kế hoạch tập luyện phù hợp với mục tiêu.",
        steps: [
          "Chọn mục tiêu tập luyện",
          "Thiết lập lịch tập",
          "Chọn bài tập",
          "Lưu kế hoạch"
        ]
      },
      {
        title: "Theo dõi buổi tập",
        content: "Cách ghi lại và theo dõi tiến độ tập luyện.",
        steps: [
          "Bắt đầu buổi tập",
          "Ghi lại số lần lặp",
          "Theo dõi thời gian",
          "Kết thúc buổi tập"
        ]
      },
      {
        title: "Xem thống kê tiến độ",
        content: "Theo dõi và phân tích tiến độ tập luyện của bạn.",
        steps: [
          "Truy cập trang thống kê",
          "Xem biểu đồ tiến độ",
          "Phân tích dữ liệu",
          "Điều chỉnh kế hoạch"
        ]
      }
    ],
    "nutrition": [
      {
        title: "Thiết lập mục tiêu dinh dưỡng",
        content: "Đặt mục tiêu calo và macro phù hợp với mục tiêu fitness.",
        steps: [
          "Tính toán TDEE",
          "Đặt mục tiêu calo",
          "Phân bổ macro",
          "Lưu mục tiêu"
        ]
      },
      {
        title: "Ghi lại bữa ăn",
        content: "Cách ghi lại và theo dõi lượng thức ăn hàng ngày.",
        steps: [
          "Thêm bữa ăn",
          "Tìm kiếm thực phẩm",
          "Nhập khối lượng",
          "Lưu bữa ăn"
        ]
      }
    ],
    "profile": [
      {
        title: "Cập nhật thông tin cá nhân",
        content: "Chỉnh sửa thông tin cá nhân và sở thích.",
        steps: [
          "Truy cập hồ sơ",
          "Chỉnh sửa thông tin",
          "Cập nhật ảnh đại diện",
          "Lưu thay đổi"
        ]
      },
      {
        title: "Thiết lập mục tiêu",
        content: "Đặt và theo dõi mục tiêu fitness của bạn.",
        steps: [
          "Chọn mục tiêu chính",
          "Đặt thời gian",
          "Thiết lập lịch tập",
          "Theo dõi tiến độ"
        ]
      }
    ],
    "settings": [
      {
        title: "Cài đặt thông báo",
        content: "Tùy chỉnh các thông báo và nhắc nhở.",
        steps: [
          "Truy cập cài đặt",
          "Chọn loại thông báo",
          "Thiết lập thời gian",
          "Lưu cài đặt"
        ]
      },
      {
        title: "Cài đặt bảo mật",
        content: "Bảo vệ tài khoản với các cài đặt bảo mật.",
        steps: [
          "Đổi mật khẩu",
          "Bật xác thực 2 yếu tố",
          "Kiểm tra thiết bị",
          "Cài đặt quyền riêng tư"
        ]
      }
    ],
    "troubleshooting": [
      {
        title: "Ứng dụng không khởi động",
        content: "Khắc phục sự cố khi ứng dụng không thể khởi động.",
        steps: [
          "Kiểm tra kết nối internet",
          "Khởi động lại ứng dụng",
          "Cập nhật ứng dụng",
          "Liên hệ hỗ trợ"
        ]
      },
      {
        title: "Video không phát được",
        content: "Giải quyết vấn đề video bài tập không phát được.",
        steps: [
          "Kiểm tra kết nối mạng",
          "Tắt chặn quảng cáo",
          "Thử trình duyệt khác",
          "Xóa cache trình duyệt"
        ]
      }
    ]
  };

  const filteredGuides = guides[selectedCategory].filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Hướng dẫn sử dụng</h1>
          <p className="text-lg text-gray-600">Tìm hiểu cách sử dụng FitNexus hiệu quả</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categories */}
              <nav className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredGuides.length > 0 ? (
                filteredGuides.map((guide, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{guide.content}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Các bước thực hiện:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-gray-700">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hướng dẫn</h3>
                  <p className="text-gray-600">Hãy thử từ khóa khác hoặc danh mục khác</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Mẹo nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">1</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Sử dụng tính năng tìm kiếm để nhanh chóng tìm bài tập phù hợp
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">2</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Thiết lập nhắc nhở để không bỏ lỡ buổi tập
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">3</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Theo dõi thống kê thường xuyên để điều chỉnh kế hoạch
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">4</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Kết nối với cộng đồng để có thêm động lực
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cần hỗ trợ thêm?</h3>
                <p className="text-gray-600 mb-4">Nếu bạn không tìm thấy câu trả lời, hãy liên hệ với chúng tôi</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Liên hệ hỗ trợ
                  </button>
                  <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                    Xem FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
