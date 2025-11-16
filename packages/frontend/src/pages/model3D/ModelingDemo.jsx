import React from "react";
import { useNavigate } from "react-router-dom";
import ModelViewer from "../../components/ModelViewer.jsx";
import useModelingController from "../../features/modeling/useModelingController.js";
import HeaderDemo from "../../components/header/HeaderDemo.jsx";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { useAuth } from "../../context/auth.context.jsx";

function ModelingDemo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const {
    selectedMuscleGroup,
    exercises,
    loading,
    error,
    isPanelOpen,
    isPrimaryOpen,
    isSecondaryOpen,
    primaryExercises,
    secondaryExercises,
    handleSelectMuscle,
    togglePanel,
    togglePrimary,
    toggleSecondary,
    formatGroupLabel,
  } = useModelingController({ persistInURL: false });

  return (
    <div className="min-h-screen bg-white text-black">
      {isAuthenticated ? <HeaderLogin /> : <HeaderDemo />}

      <main className="max-w-6xl px-4 py-10 mx-auto">
        {/* HERO */}
        <section className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-200">
            3D Modeling – Chọn nhóm cơ trực quan
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Mô hình hoá 3D cơ thể
          </h1>
          <p className="mt-4 text-gray-700">
            Xoay mô hình 3D toàn thân, chạm vào nhóm cơ bạn muốn cải thiện và
            xem ngay danh sách bài tập chính/phụ phù hợp. Kết nối trực tiếp với
            thư viện bài tập Fitnexus.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3">
            <div className="p-4 bg-white border rounded-xl border-purple-200/70">
              <h3 className="text-sm font-semibold text-gray-900">
                Nhìn toàn cảnh cơ thể
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Xoay, phóng to/thu nhỏ để quan sát rõ từng vùng cơ.
              </p>
            </div>
            <div className="p-4 bg-white border rounded-xl border-purple-200/70">
              <h3 className="text-sm font-semibold text-gray-900">
                Chọn nhóm cơ trực tiếp
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Click vào vùng cơ quan tâm để xem bài tập gợi ý.
              </p>
            </div>
            <div className="p-4 bg-white border rounded-xl border-purple-200/70">
              <h3 className="text-sm font-semibold text-gray-900">
                Kết nối thư viện bài tập
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Mở chi tiết bài tập, lưu lại và gắn vào kế hoạch luyện tập.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() =>
                isAuthenticated
                  ? navigate("/modeling")
                  : navigate("/login", { state: { from: "/modeling" } })
              }
              className="px-6 py-3 text-sm font-semibold text-white rounded-full bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {isAuthenticated
                ? "Mở mô hình hoá 3D"
                : "Đăng nhập để trải nghiệm đầy đủ"}
            </button>
          </div>
        </section>

        {/* INTERACTIVE PREVIEW */}
        <section className="mt-14">
          <div className="overflow-hidden border rounded-2xl shadow-sm bg-gray-50">
            <div className="flex flex-col md:flex-row">
              {/* Left side - 3D Model */}
              <div className="w-full p-4 bg-gray-50 border-b md:w-2/5 md:border-b-0 md:border-r">
                <div className="flex flex-col h-full">
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Thử tương tác với mô hình 3D
                    </h2>
                    <p className="text-sm text-gray-600">
                      Kéo để xoay, cuộn để phóng to/thu nhỏ. Click vào vùng cơ
                      để xem gợi ý bài tập tương ứng.
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden bg-white rounded-lg">
                    <ModelViewer onSelectMuscleGroup={handleSelectMuscle} />
                  </div>
                </div>
              </div>

              {/* Right side - Exercises preview */}
              <div className="flex flex-col w-full bg-white md:w-3/5">
                {/* Filters (preview disabled) */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block mb-1 text-xs font-medium text-gray-700">
                        Cấp độ
                      </label>
                      <select
                        disabled
                        className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 text-xs font-medium text-gray-700">
                        Tác động
                      </label>
                      <select
                        disabled
                        className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      >
                        <option value="all">Primary & Secondary</option>
                        <option value="primary">Chỉ Primary</option>
                        <option value="secondary">Chỉ Secondary</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 text-xs font-medium text-gray-700">
                        Sắp xếp
                      </label>
                      <select
                        disabled
                        className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      >
                        <option value="name">Tên A-Z</option>
                        <option value="popular">Phổ biến nhất</option>
                        <option value="level">Theo cấp độ</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Exercise lists area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 max-h-[420px]">
                  {!selectedMuscleGroup && (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="max-w-md text-sm text-gray-600">
                        Chọn nhóm cơ trên mô hình 3D để xem danh sách bài tập
                        minh hoạ. Đăng nhập để trải nghiệm đầy đủ trong phiên
                        bản chính thức.
                      </div>
                    </div>
                  )}

                  {selectedMuscleGroup && (
                    <div className="space-y-4">
                      {/* Confirmation button to toggle panel */}
                      <button
                        type="button"
                        onClick={togglePanel}
                        className="flex items-center justify-between w-full p-4 transition bg-white rounded-lg shadow hover:shadow-md"
                      >
                        <div className="text-left">
                          <div className="text-sm text-gray-500">
                            {isPanelOpen
                              ? "Thu gọn danh sách bài tập"
                              : `Bạn muốn chọn nhóm cơ ${formatGroupLabel(
                                  selectedMuscleGroup
                                )} này?`}
                          </div>
                          <div className="text-lg font-semibold text-gray-800">
                            {formatGroupLabel(selectedMuscleGroup)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isPanelOpen && (
                            <span className="px-2 py-1 text-xs text-blue-700 rounded-full bg-blue-50">
                              {exercises.length}
                            </span>
                          )}
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              isPanelOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {isPanelOpen && (
                        <>
                          <button
                            type="button"
                            onClick={togglePrimary}
                            className="flex items-center justify-between w-full p-4 transition bg-white rounded-lg shadow hover:shadow-md"
                          >
                            <div className="text-left">
                              <div className="text-sm text-gray-500">
                                Bài tập tác động chính
                              </div>
                              <div className="text-lg font-semibold text-gray-800">
                                Primary
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 text-xs text-blue-700 rounded-full bg-blue-50">
                                {primaryExercises.length}
                              </span>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                  isPrimaryOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>

                          {/* Loading state */}
                          {loading && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                              <span>Đang tải danh sách bài tập...</span>
                            </div>
                          )}

                          {/* Error state */}
                          {error && !loading && (
                            <div className="text-red-600">{error}</div>
                          )}

                          {/* Primary list */}
                          {isPrimaryOpen && !loading && !error && (
                            <div className="bg-white divide-y rounded-lg shadow">
                              {primaryExercises.length === 0 ? (
                                <div className="p-4 text-gray-500">
                                  Không có bài tập phù hợp.
                                </div>
                              ) : (
                                primaryExercises.map((ex) => (
                                  <button
                                    key={ex.id}
                                    type="button"
                                    onClick={() =>
                                      navigate(`/exercises/${ex.id}`, {
                                        state: ex,
                                      })
                                    }
                                    className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                                  >
                                    <span className="text-gray-800">
                                      {ex.name}
                                    </span>
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </button>
                                ))
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={toggleSecondary}
                            className="flex items-center justify-between w-full p-4 transition bg-white rounded-lg shadow hover:shadow-md"
                          >
                            <div className="text-left">
                              <div className="text-sm text-gray-500">
                                Bài tập hỗ trợ/phụ
                              </div>
                              <div className="text-lg font-semibold text-gray-800">
                                Secondary
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 text-xs text-blue-700 rounded-full bg-blue-50">
                                {secondaryExercises.length}
                              </span>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                  isSecondaryOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>

                          {/* Secondary list */}
                          {isSecondaryOpen && !loading && !error && (
                            <div className="bg-white divide-y rounded-lg shadow">
                              {secondaryExercises.length === 0 ? (
                                <div className="p-4 text-gray-500">
                                  Không có bài tập phù hợp.
                                </div>
                              ) : (
                                secondaryExercises.map((ex) => (
                                  <button
                                    key={ex.id}
                                    type="button"
                                    onClick={() =>
                                      navigate(`/exercises/${ex.id}`, {
                                        state: ex,
                                      })
                                    }
                                    className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                                  >
                                    <span className="text-gray-800">
                                      {ex.name}
                                    </span>
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO USE */}
        <section className="max-w-5xl mx-auto mt-16">
          <h2 className="text-xl font-semibold text-gray-900">
            Cách sử dụng mô hình 3D
          </h2>
          <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
            <div className="p-5 bg-white border rounded-2xl border-purple-200/70">
              <h3 className="text-base font-semibold text-gray-900">
                Bước 1 — Xoay & phóng to mô hình
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Dùng chuột hoặc thao tác chạm để xoay 360° mô hình, cuộn để
                phóng to/thu nhỏ. Hãy quan sát kỹ vùng cơ bạn muốn cải thiện.
              </p>
            </div>
            <div className="p-5 bg-white border rounded-2xl border-purple-200/70">
              <h3 className="text-base font-semibold text-gray-900">
                Bước 2 — Chọn nhóm cơ trên mô hình
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Di chuột và click trực tiếp lên vùng cơ (vai, ngực, chân...).
                Khu vực được chọn sẽ được làm nổi bật để bạn dễ nhận biết.
              </p>
            </div>
            <div className="p-5 bg-white border rounded-2xl border-purple-200/70">
              <h3 className="text-base font-semibold text-gray-900">
                Bước 3 — Xem bài tập gợi ý
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Ở panel bên phải, Fitnexus hiển thị danh sách bài tập tác động
                chính (Primary) và hỗ trợ (Secondary) cho nhóm cơ đó. Nhấp vào
                từng bài để xem hướng dẫn chi tiết.
              </p>
            </div>
            <div className="p-5 bg-white border rounded-2xl border-purple-200/70">
              <h3 className="text-base font-semibold text-gray-900">
                Bước 4 — Áp dụng vào kế hoạch luyện tập
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Khi đã đăng nhập, bạn có thể mở phiên bản đầy đủ, thêm bài tập
                phù hợp vào kế hoạch và theo dõi tiến độ trực tiếp trong
                Fitnexus.
              </p>
            </div>
          </div>
        </section>

        {/* CTA CUỐI TRANG */}
        <section className="max-w-3xl mx-auto mt-14 text-center">
          <button
            onClick={() =>
              isAuthenticated
                ? navigate("/modeling")
                : navigate("/login", { state: { from: "/modeling" } })
            }
            className="px-6 py-3 text-sm font-semibold text-white rounded-full bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {isAuthenticated
              ? "Bắt đầu với mô hình hoá 3D"
              : "Đăng nhập để bắt đầu"}
          </button>
          <p className="mt-3 text-xs text-gray-600">
            Mẹo: hãy thử chọn nhiều nhóm cơ khác nhau để hình dung cơ thể một
            cách trực quan trước khi xây dựng kế hoạch luyện tập.
          </p>
        </section>
      </main>
    </div>
  );
}

export default ModelingDemo;
