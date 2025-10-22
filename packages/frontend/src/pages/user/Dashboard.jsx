import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";
import logo from "../../assets/logo.png";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  const displayName = (user?.username || "").replaceAll("_", " ");

  return (
    <div className="flex flex-col min-h-screen text-black bg-white">
      <header className="fixed top-0 left-0 right-0 z-10 shadow-sm backdrop-blur-xl bg-blend-saturation bg-bg-secondary/90">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          {/* Logo → chỉ reload trang dashboard */}
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer -m-1.5 p-1.5"
            onClick={() => window.location.reload()}
          >
            <img src={logo} alt="Fitnexus logo" className="h-10" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Fitnexus
            </span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <button
              className="text-base text-gray-800 hover:underline"
              onClick={() => navigate("/modeling-demo")}
            >
              Mô hình hoá
            </button>
            <button
              className="text-base text-gray-800 hover:underline"
              onClick={() => navigate("/exercises")}
            >
              Thư viện tập
            </button>
            <button
              className="text-base text-gray-800 hover:underline"
              onClick={() => navigate("/nutrition-ai")}
            >
              Dinh dưỡng
            </button>
            <button
              className="text-base text-gray-800 hover:underline"
              onClick={() => navigate("/community")}
            >
              Cộng đồng
            </button>
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center justify-center w-10 h-10 font-medium text-white rounded-full bg-gradient-to-r from-blue-400 to-blue-600">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                </button>
                {showAvatarMenu && (
                  <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        navigate("/profile");
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        navigate("/settings");
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Cài đặt
                    </button>
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        handleLogout();
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="transition hover:text-blue-400"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </button>
                <button
                  className="px-6 py-3 font-semibold text-black transition bg-white rounded-full hover:bg-gray-200"
                  onClick={() => navigate("/register")}
                >
                  Bắt đầu ngay
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Overlay đóng menu */}
      {showAvatarMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAvatarMenu(false)}
        />
      )}

      {/* Nội dung chính */}
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-6xl px-6 mx-auto">
          <h1 className="mb-2 text-3xl font-bold text-blue-700">Bảng điều khiển</h1>
          <p className="mb-8 text-gray-600">
            {user ? (
              <>
                Chào mừng <b>{user.fullName || displayName}</b>!  <br />
                Gói hiện tại: <b>{user.plan || "FREE"}</b> · Vai trò:{" "}
                <b>{user.role}</b>
              </>
            ) : (
              "Đang tải thông tin người dùng..."
            )}
          </p>

          {/* Cards thống kê */}
          <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
            <div className="p-6 bg-white border-t-4 border-blue-600 shadow-md rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Buổi tập trong tuần</h3>
              <p className="mt-2 text-4xl font-bold text-blue-700">5</p>
            </div>
            <div className="p-6 bg-white border-t-4 border-green-500 shadow-md rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Bài tập hoàn thành</h3>
              <p className="mt-2 text-4xl font-bold text-green-600">42</p>
            </div>
            <div className="p-6 bg-white border-t-4 border-purple-500 shadow-md rounded-xl">
              <h3 className="text-sm font-medium text-gray-500">Tổng thời gian</h3>
              <p className="mt-2 text-4xl font-bold text-purple-600">12h 30p</p>
            </div>
          </div>

          {/* Biểu đồ tiến trình (placeholder) */}
          <section className="p-6 mb-10 bg-white shadow-md rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Tiến trình gần đây</h2>
            <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed rounded-lg">
              Biểu đồ tiến trình sẽ hiển thị ở đây
            </div>
          </section>

          {/* Lịch sử luyện tập (cập nhật sau) */}
          <section className="p-6 bg-white shadow-md rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Lịch sử luyện tập</h2>
            <p className="italic text-gray-500">
              Tính năng này sẽ được cập nhật sau...
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-16 mt-auto bg-gray-500 border-t">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 mb-12 md:grid-cols-4">
            <div>
              <div className="text-base/6 text-zinc-950 dark:text-white hover:underline -m-1.5 p-1.5 shrink-0">
                <img src={logo} alt="Fitnexus logo" className="h-48" />
              </div>
              <p className="text-gray-200">
                Nền tảng luyện tập thông minh với AI
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Tính năng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Giá cả
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/exercises-demo")}
                    className="hover:text-white"
                  >
                    Thư viện
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Công ty</h3>
              <ul className="space-y-2 text-gray-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Điều khoản
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Bảo mật
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-gray-200 border-t border-gray-800">
            <p>© 2025 Fitnexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
