import React from "react";
import { useAuth } from "../../context/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import ChatWidget from "../../components/common/ChatWidget.jsx";

// Simple route map to trigger navbar or navigate
const VXP_ROUTE_MAP = {
  home: "/",
  ai: "/ai",
  modeling: "/modeling",
  workout: "/exercises",
  plans: "/plans",
  "plan-create": "/plans/new",
  nutrition: "/nutrition-ai",
  community: "/community",
  pricing: "/pricing",
};

function vxpGo(key, navigate) {
  const el = document.querySelector(`[data-nav="${key}"]`);
  if (el) {
    el.click();
    return;
  }
  const to = VXP_ROUTE_MAP[key];
  if (to) navigate(to);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-white">
      {/* HEADER */}
      <HeaderLogin />

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 bg-gradient-to-r from-[#0b1023] via-[#101735] to-[#162142] text-white rounded-b-[3rem] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="object-cover w-full h-full">
            <source src="/vidbgr.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/70"></div>
        </div>
        <div className="z-10 space-y-6 text-center md:w-1/2 md:text-left">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Trải nghiệm <span className="text-blue-400">AI Workout</span>
            <br />
            cùng Fitnexus
          </h1>
          <p className="max-w-lg text-lg text-gray-300">
            Kết hợp AI, mô hình hoá chuyển động, dinh dưỡng và cộng đồng giúp bạn luyện tập hiệu quả hơn mỗi ngày.
          </p>
          <div className="flex justify-center gap-4 md:justify-start">
            <button className="px-8 py-3 font-semibold bg-blue-400 rounded-lg hover:bg-blue-600" onClick={() => vxpGo("workout", navigate)}>
              Bắt đầu miễn phí
            </button>
            <button className="px-8 py-3 font-semibold border border-blue-400 rounded-lg hover:bg-blue-400/10" onClick={() => vxpGo("pricing", navigate)}>
              Nâng cấp Premium
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: 30% Achievements / 70% Navigation */}
      <section className="px-8 md:px-20 py-16 bg-white">
        <div className="grid gap-8 lg:grid-cols-10">
          {/* Left 30%: Thành tựu / Kế hoạch / Streak */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Hero metric */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-bold text-lg">Thành tựu hôm nay</h3>
                <span className="text-xs text-slate-500">Placeholder</span>
              </div>
              <div className="mt-4">
                <div className="text-5xl font-extrabold text-slate-900 tracking-tight">—</div>
                <div className="mt-3 text-sm text-slate-500">So với hôm qua: —</div>
                <div className="mt-5 h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 w-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                </div>
                <div className="mt-2 text-xs text-slate-500">Tiến độ đạt mục tiêu: —%</div>
              </div>
            </div>

            {/* Kế hoạch (Plan) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-bold">Kế hoạch của bạn</h3>
                <button onClick={() => vxpGo("plans", navigate)} className="text-blue-600 text-sm font-semibold hover:underline">
                  Xem tất cả
                </button>
              </div>
              <ul className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-slate-700 font-medium">Plan #{i}</div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-0 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Tiến độ: —%</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Streak / Bảng xếp hạng placeholders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-slate-900 font-bold">Chuỗi ngày (Streak)</h3>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-md border border-dashed border-slate-300 bg-slate-50"></div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-500">Sẽ hiển thị dải streak thật khi có dữ liệu.</div>
            </div>
          </aside>

          {/* Right 70%: Điều hướng tính năng + ảnh placeholder */}
          <main className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Khám phá các tính năng nổi bật của Fitnexus</h2>
              <p className="mt-2 text-slate-600">
                Không dùng icon. Hình ảnh thật sẽ được bạn thêm vào vùng dưới của mỗi khung; phần mô tả nằm ở trên.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* AI Trainer */}
              <button
                type="button"
                onClick={() => vxpGo("ai", navigate)}
                className="group text-left rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="text-slate-900 font-bold text-lg">AI Trainer</div>
                  <div className="mt-1 text-sm text-slate-600">Trợ lý luyện tập thông minh giúp phân tích và hướng dẫn kỹ thuật.</div>
                </div>
                <div className="h-44 md:h-52 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
                  <div className="w-11/12 h-5/6 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
                    Placeholder ảnh
                  </div>
                </div>
              </button>

              {/* Luyện tập */}
              <button
                type="button"
                onClick={() => vxpGo("workout", navigate)}
                className="group text-left rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="text-slate-900 font-bold text-lg">Luyện tập</div>
                  <div className="mt-1 text-sm text-slate-600">Chương trình bài tập phù hợp từng nhóm cơ và cấp độ.</div>
                </div>
                <div className="h-44 md:h-52 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
                  <div className="w-11/12 h-5/6 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
                    Placeholder ảnh
                  </div>
                </div>
              </button>

              {/* Mô hình hoá */}
              <button
                type="button"
                onClick={() => vxpGo("modeling", navigate)}
                className="group text-left rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="text-slate-900 font-bold text-lg">Mô hình hoá</div>
                  <div className="mt-1 text-sm text-slate-600">Phân tích chuyển động 3D để tối ưu hiệu quả bài tập.</div>
                </div>
                <div className="h-44 md:h-52 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
                  <div className="w-11/12 h-5/6 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
                    Placeholder ảnh
                  </div>
                </div>
              </button>

              {/* Dinh dưỡng */}
              <button
                type="button"
                onClick={() => vxpGo("nutrition", navigate)}
                className="group text-left rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="text-slate-900 font-bold text-lg">Dinh dưỡng</div>
                  <div className="mt-1 text-sm text-slate-600">Theo dõi khẩu phần và gợi ý bữa ăn theo mục tiêu.</div>
                </div>
                <div className="h-44 md:h-52 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
                  <div className="w-11/12 h-5/6 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
                    Placeholder ảnh
                  </div>
                </div>
              </button>

              {/* Cộng đồng */}
              <button
                type="button"
                onClick={() => vxpGo("community", navigate)}
                className="group text-left rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm transition overflow-hidden md:col-span-2"
              >
                <div className="p-5">
                  <div className="text-slate-900 font-bold text-lg">Cộng đồng</div>
                  <div className="mt-1 text-sm text-slate-600">Kết nối, chia sẻ kinh nghiệm và tham gia thử thách.</div>
                </div>
                <div className="h-56 bg-slate-100 border-t border-slate-200 flex items-center justify-center">
                  <div className="w-11/12 h-5/6 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
                    Placeholder ảnh lớn
                  </div>
                </div>
              </button>
            </div>
          </main>
        </div>
      </section>

      {/* PROGRAMS / PRICING */}
      {user?.user_type !== "premium" && (
        <section className="relative px-8 py-24 overflow-hidden text-center bg-gradient-to-b from-gray-50 via-white to-gray-100 md:px-20">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900">
            Gói dịch vụ <span className="text-blue-600">Fitnexus</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-14">
            Lựa chọn gói phù hợp: từ miễn phí đến Premium với AI thông minh và báo cáo nâng cao.
          </p>

          <div className="relative z-10 grid max-w-6xl gap-12 mx-auto md:grid-cols-2">
            {/* Free */}
            <div className="relative bg-white rounded-2xl shadow-md transition-all duration-300 border border-gray-200 hover:shadow-lg">
              <div className="absolute px-4 py-1 text-xs font-semibold tracking-wide text-gray-700 uppercase bg-gray-200 rounded-full -top-3 left-6">
                Gói cơ bản
              </div>
              <div className="flex flex-col items-center p-10">
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Gói Free</h3>
                <p className="mb-6 text-sm text-gray-500">Trải nghiệm Fitnexus cơ bản.</p>
                <h4 className="mb-4 text-4xl font-extrabold text-blue-600">0₫</h4>
                <ul className="mb-8 space-y-2 text-sm text-left text-gray-600">
                  <li>Truy cập AI cơ bản</li>
                  <li>Theo dõi bài tập & lịch luyện</li>
                  <li>Không có phân tích chuyên sâu</li>
                  <li>Không có gợi ý dinh dưỡng cá nhân</li>
                </ul>
                <button className="px-8 py-3 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300" onClick={() => vxpGo("workout", navigate)}>
                  Dùng miễn phí
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="relative text-white transition-all duration-300 border border-blue-400 shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl hover:scale-[1.02]">
              <div className="absolute px-4 py-1 text-xs font-bold tracking-wide text-gray-900 uppercase bg-yellow-400 rounded-full -top-3 right-6">
                Best Choice
              </div>

              <div className="flex flex-col items-center p-12">
                <h3 className="mb-3 text-2xl font-bold text-white">Gói Premium</h3>
                <p className="max-w-sm mb-6 text-sm text-gray-200">Phân tích 3D, báo cáo chi tiết, gợi ý dinh dưỡng, AI Trainer chuyên nghiệp.</p>
                <h4 className="mb-4 text-5xl font-extrabold text-yellow-300">
                  99.000₫<span className="text-lg font-medium text-gray-200">/tháng</span>
                </h4>

                <ul className="mb-8 space-y-2 text-sm text-left text-gray-100">
                  <li>Toàn bộ tính năng Free</li>
                  <li>Phân tích cơ thể 3D bằng AI</li>
                  <li>Báo cáo tiến trình luyện tập</li>
                  <li>Gợi ý dinh dưỡng cá nhân</li>
                  <li>AI Trainer chuyên nghiệp</li>
                </ul>

                <button className="px-10 py-4 text-lg font-extrabold text-blue-900 bg-yellow-400 rounded-lg shadow-lg hover:shadow-xl hover:scale-105" onClick={() => vxpGo("pricing", navigate)}>
                  Nâng cấp ngay
                </button>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        </section>
      )}

      {/* REVIEWS: placeholder (no fake data) */}
      <section className="px-8 md:px-20 py-16 bg-white">
        <div className="max-w-7xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900">Đánh giá từ cộng đồng</h2>
            <button onClick={() => vxpGo("community", navigate)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Xem tất cả đánh giá
            </button>
          </div>
          <div className="mt-6">
            <div className="h-36 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500">
              Chưa có đánh giá hiển thị. Chức năng đánh giá sẽ được bổ sung, hiển thị dữ liệu thật.
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-20 px-6 md:px-20 bg-gradient-to-br from-blue-200 via-blue-400 to-indigo-400 text-white overflow-hidden rounded-t-[3rem] mt-16 mb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl">
            Sẵn sàng thay đổi bản thân?
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-200 md:text-xl">
            Khám phá nền tảng huấn luyện AI giúp bạn đạt phong độ đỉnh cao.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mb-4 md:flex-row">
            <button className="px-10 py-4 text-lg font-bold text-blue-700 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105" onClick={() => vxpGo("workout", navigate)}>
              Đăng ký ngay
            </button>
            <button className="px-10 py-4 text-lg font-semibold text-white border rounded-full border-white/60 hover:bg-white/10" onClick={() => vxpGo("pricing", navigate)}>
              Xem gói Premium
            </button>
          </div>
        </div>

        <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 bg-blue-400/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 w-32 h-32 rounded-full left-10 bg-indigo-500/30 blur-3xl animate-pulse"></div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1023] text-gray-300 py-16 px-8 md:px-20 border-t border-gray-800">
        <div className="grid gap-12 mx-auto max-w-7xl md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-2xl font-extrabold text-white">Fitnexus</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng huấn luyện thế hệ mới ứng dụng AI. Theo dõi - Phân tích - Cải thiện — tất cả trong một.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Tính năng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="text-left transition hover:text-blue-400" onClick={() => vxpGo("ai", navigate)}>
                  AI Trainer
                </button>
              </li>
              <li>
                <button className="text-left transition hover:text-blue-400" onClick={() => vxpGo("workout", navigate)}>
                  Luyện tập
                </button>
              </li>
              <li>
                <button className="text-left transition hover:text-blue-400" onClick={() => vxpGo("modeling", navigate)}>
                  Mô hình hoá
                </button>
              </li>
              <li>
                <button className="text-left transition hover:text-blue-400" onClick={() => vxpGo("nutrition", navigate)}>
                  Dinh dưỡng
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition hover:text-blue-400">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">Điều khoản sử dụng</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">Liên hệ</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Theo dõi chúng tôi</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="#" className="transition hover:text-blue-400">Facebook</a>
              <a href="#" className="transition hover:text-blue-400">Instagram</a>
              <a href="#" className="transition hover:text-blue-400">YouTube</a>
            </div>
            <p className="mt-8 text-sm text-gray-400">© 2025 Fitnexus. All rights reserved.</p>
          </div>
        </div>

        <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t border-gray-700">
          Designed by Fitnexus Team | Powered by AI & Passion
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

