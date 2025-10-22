import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context";
import React, { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";

const HeaderDemo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [showWorkoutDropdown, setShowWorkoutDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkoutDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between py-0 mx-auto px-7 max-w-7xl">
              <button
                onClick={() => navigate("/")}
                className="text-base/6 text-zinc-950 hover:opacity-80 transition -m-1.5 p-1.5 shrink-0"
              >
                <img src={logo} alt="Fitnexus logo" className="h-36" />
              </button>
              <nav className="items-center hidden gap-6 md:flex">
                <button
                  className="text-base text-gray-800 transition hover:text-blue-500"
                  onClick={() => navigate("/modeling-demo")}
                >
                  Mô hình hoá
                </button>
    
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowWorkoutDropdown(!showWorkoutDropdown)}
                    className="text-base text-gray-800 transition hover:text-blue-500"
                  >
                    Luyện tập
                  </button>
    
                  {showWorkoutDropdown && (
                    <div className="absolute left-0 z-50 py-2 mt-2 bg-white border border-gray-200 shadow-xl top-full w-72 rounded-xl animate-fadeIn">
                      <div className="px-3 py-2">
                        <div className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                          Thư viện bài tập
                        </div>
                        <button
                          onClick={() => {
                            navigate("/exercises-demo");
                            setShowWorkoutDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            Xem tất cả bài tập
                          </div>
                          <div className="text-xs text-gray-500">
                            1000+ bài tập theo nhóm cơ
                          </div>
                        </button>
                      </div>
    
                      <div className="h-px my-2 bg-gray-200" />
    
                      <div className="px-3 py-2">
                        <div className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                          Kế hoạch tập luyện
                        </div>
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate("/login", { state: { from: "/plans" } });
                            } else {
                              navigate("/plans");
                            }
                            setShowWorkoutDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            Kế hoạch của tôi
                          </div>
                          <div className="text-xs text-gray-500">
                            Quản lý các plan đã tạo
                          </div>
                        </button>
    
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate("/login", { state: { from: "/plans/new" } });
                            } else {
                              navigate("/plans/new");
                            }
                            setShowWorkoutDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition mt-1"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            Tạo plan mới
                          </div>
                          <div className="text-xs text-gray-500">
                            Lên kế hoạch tập luyện riêng
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
    
                <button
                  type="button"
                  onClick={() => navigate("/nutrition-ai")}
                  className="text-base text-gray-800 transition hover:text-blue-500"
                >
                  Khám phá Nutrition AI
                </button>
                <a
                  href="#blog"
                  className="text-base text-gray-800 transition hover:text-blue-500"
                >
                  Cộng đồng
                </a>
              </nav>
              <div className="flex items-center gap-4">
                <button
                  className="font-extrabold text-gray-700 transition text-pretty hover:text-blue-600"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </button>
                <button className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full hover:shadow-lg transition">
                  Bắt đầu ngay
                </button>
              </div>
            </div>
          </header>
  )
};

export default HeaderDemo;
