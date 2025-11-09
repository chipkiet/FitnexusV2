import React from "react";
import { useAuth } from "../../context/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { Dumbbell, Users, Brain, Apple } from "lucide-react";

/* ===== VXP helpers: ưu tiên trigger nút trên Navbar qua data-nav, fallback navigate ===== */
const VXP_ROUTE_MAP = {
  home: "/",
  ai: "/ai",
  modeling: "/modeling",
  workout: "/exercises", // ⬅ đi thẳng vào trang bài tập
  plans: "/plans",
  "plan-create": "/plans/new",
  nutrition: "/nutrition-ai",
  community: "/community",
  pricing: "/pricing",
};

function vxpGo(key, navigate) {
  const el = document.querySelector(`[data-nav="${key}"]`);
  if (el) {
    el.click(); // dùng chính Navbar để điều hướng
    return;
  }
  // fallback
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
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
          >
            <source src="/vidbgr.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-gray/70"></div>
        </div>
        <div className="z-10 space-y-6 text-center md:w-1/2 md:text-left">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Complete <span className="text-blue-400">AI Workout</span> <br />
            Experience with Fitnexus
          </h1>
          <p className="max-w-lg text-lg text-gray-300">
            Kết hợp AI, mô hình hoá chuyển động, dinh dưỡng và cộng đồng năng
            động giúp bạn tập luyện hiệu quả hơn mỗi ngày.
          </p>
          <div className="flex justify-center gap-4 md:justify-start">
            <button
              className="px-8 py-3 font-semibold bg-blue-400 rounded-lg hover:bg-blue-600"
              onClick={() => vxpGo("workout", navigate)}
            >
              Bắt đầu miễn phí
            </button>
            <button
              className="px-8 py-3 font-semibold border border-blue-400 rounded-lg hover:bg-blue-400/10"
              onClick={() => vxpGo("pricing", navigate)}
            >
              Nâng cấp Premium
            </button>
          </div>
        </div>

        {/* Right side intentionally removed; video background covers hero */}
      </section>

      {/* ABOUT / FEATURES */}
      <section className="px-8 py-16 text-center bg-white md:px-20">
        <h2 className="mb-6 text-4xl font-bold text-gray-900">
          Giới thiệu về <span className="text-black-200">Fitnexus</span>
        </h2>
        <p className="max-w-3xl mx-auto mb-12 leading-relaxed text-gray-600">
          Fitnexus là nền tảng tập luyện thế hệ mới giúp bạn đạt được hiệu quả
          tối đa với AI Trainer, mô hình hóa chuyển động và kế hoạch dinh dưỡng
          cá nhân. Dù bạn mới bắt đầu hay đã là dân gym lâu năm, Fitnexus sẽ
          đồng hành cùng bạn trên hành trình phát triển toàn diện.
        </p>

        {/* FEATURES SECTION */}
        <section className="px-6 py-10 text-center bg-white border-b border-gray-200 md:px-20">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Khám phá các tính năng nổi bật của{" "}
            <span className="text-blue-600">Fitnexus</span>
          </h2>

          <div className="grid gap-6 text-sm md:grid-cols-5">
            {/* AI */}
            <button
              type="button"
              onClick={() => vxpGo("ai", navigate)}
              className="p-5 text-left transition border border-gray-200 cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-xl hover:border-blue-400"
            >
              <Brain size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="mb-2 font-semibold text-center text-gray-900">
                AI
              </h3>
              <p className="text-gray-600">
                Trợ lý huấn luyện viên ảo giúp phân tích tư thế, chấm điểm kỹ
                thuật và gợi ý điều chỉnh.
              </p>
            </button>

            {/* Luyện tập */}
            <button
              type="button"
              onClick={() => vxpGo("workout", navigate)}
              className="p-5 text-left transition border border-gray-200 cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-xl hover:border-blue-400"
            >
              <Dumbbell size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="mb-2 font-semibold text-center text-gray-900">
                Luyện tập
              </h3>
              <p className="text-gray-600">
                Hàng trăm bài tập được thiết kế cho từng nhóm cơ, cấp độ và mục
                tiêu cụ thể.
              </p>
            </button>

            {/* Mô hình hoá */}
            <button
              type="button"
              onClick={() => vxpGo("modeling", navigate)}
              className="p-5 text-left transition border border-gray-200 cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-xl hover:border-blue-400"
            >
              <Brain size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="mb-2 font-semibold text-center text-gray-900">
                Mô hình hoá
              </h3>
              <p className="text-gray-600">
                Phân tích chuyển động bằng công nghệ 3D giúp bạn nhìn rõ và tối
                ưu động tác.
              </p>
            </button>

            {/* Dinh dưỡng */}
            <button
              type="button"
              onClick={() => vxpGo("nutrition", navigate)}
              className="p-5 text-left transition border border-gray-200 cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-xl hover:border-blue-400"
            >
              <Apple size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="mb-2 font-semibold text-center text-gray-900">
                Dinh dưỡng
              </h3>
              <p className="text-gray-600">
                Theo dõi chế độ ăn và gợi ý thực đơn phù hợp theo mục tiêu tăng
                cơ hoặc giảm mỡ.
              </p>
            </button>

            {/* Cộng đồng */}
            <button
              type="button"
              onClick={() => vxpGo("community", navigate)}
              className="p-5 text-left transition border border-gray-200 cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-xl hover:border-blue-400"
            >
              <Users size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="mb-2 font-semibold text-center text-gray-900">
                Cộng đồng
              </h3>
              <p className="text-gray-600">
                Kết nối, chia sẻ kinh nghiệm, tham gia thử thách và lan toả tinh
                thần thể thao.
              </p>
            </button>
          </div>
        </section>
      </section>

      {/* PROGRAMS / PRICING */}
      {user?.user_type !== "premium" && (
        <section className="relative px-8 py-24 overflow-hidden text-center bg-gradient-to-b from-gray-50 via-white to-gray-100 md:px-20">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900">
            Gói dịch vụ <span className="text-blue-600">Fitnexus</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-14">
            Lựa chọn gói tập luyện phù hợp với bạn — từ cơ bản miễn phí đến
            Premium chuyên nghiệp với AI thông minh và báo cáo nâng cao.
          </p>

          <div className="relative z-10 grid max-w-6xl gap-12 mx-auto md:grid-cols-2">
            {/* Gói Free */}
            <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-[1.02]">
              <div className="absolute px-4 py-1 text-xs font-semibold tracking-wide text-gray-700 uppercase bg-gray-200 rounded-full -top-3 left-6">
                Gói cơ bản
              </div>
              <div className="flex flex-col items-center p-10">
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Gói Free
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  Trải nghiệm Fitnexus cơ bản — phù hợp cho người mới bắt đầu
                  làm quen với AI Workout.
                </p>
                <h4 className="mb-4 text-4xl font-extrabold text-blue-600">
                  0₫
                </h4>

                <ul className="mb-8 space-y-2 text-sm text-left text-gray-600">
                  <li> Truy cập AI cơ bản</li>
                  <li> Theo dõi bài tập & lịch luyện</li>
                  <li> Không có phân tích chuyên sâu</li>
                  <li> Không có gợi ý dinh dưỡng cá nhân hoá</li>
                </ul>

                <button
                  className="px-8 py-3 font-semibold text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => vxpGo("workout", navigate)}
                >
                  Dùng miễn phí
                </button>
              </div>
            </div>

            {/* Gói Premium */}
            <div className="relative text-white transition-all duration-300 border border-blue-400 shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl hover:scale-105">
              {/* Ribbon */}
              <div className="absolute px-4 py-1 text-xs font-bold tracking-wide text-gray-900 uppercase bg-yellow-400 rounded-full -top-3 right-6">
                Best Choice
              </div>

              <div className="flex flex-col items-center p-12">
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Gói Premium
                </h3>
                <p className="max-w-sm mb-6 text-sm text-gray-200">
                  Dành cho người muốn bứt phá – phân tích tư thế 3D, gợi ý chế
                  độ ăn, và huấn luyện viên AI chuyên nghiệp.
                </p>
                <h4 className="mb-4 text-5xl font-extrabold text-yellow-300">
                  99.000₫
                  <span className="text-lg font-medium text-gray-200">
                    /tháng
                  </span>
                </h4>

                <ul className="mb-8 space-y-2 text-sm text-left text-gray-100">
                  <li>✨ Toàn bộ tính năng Free</li>
                  <li>✨ Phân tích tư thế 3D bằng AI</li>
                  <li>✨ Báo cáo chi tiết tiến trình luyện tập</li>
                  <li>✨ Gợi ý dinh dưỡng cá nhân hoá</li>
                  <li>✨ Trợ lý AI Trainer chuyên nghiệp</li>
                </ul>

                <button
                  className="px-10 py-4 text-lg font-extrabold text-blue-900 transition bg-yellow-400 rounded-lg shadow-lg hover:shadow-xl hover:scale-105"
                  onClick={() => vxpGo("pricing", navigate)}
                >
                  Nâng cấp ngay
                </button>
              </div>
            </div>
          </div>

          {/* Background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.08),transparent_70%)]"></div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="px-8 md:px-20 py-20 text-center bg-[#9ab5de] text-white">
        <h2 className="mb-12 text-4xl font-bold text-white">
          Người dùng nói gì về <span className="text-black-400">Fitnexus</span>
        </h2>

        <div className="grid gap-8 mx-auto md:grid-cols-4 max-w-7xl">
          {[
            {
              name: "Minh Anh",
              date: "Aug 11, 2025",
              text: "Ứng dụng này đã thay đổi hoàn toàn cách tôi luyện tập. Các bài tập mới mẻ, hướng dẫn video rõ ràng và gợi ý dinh dưỡng thông minh giúp tôi duy trì thói quen tập luyện mỗi ngày.",
            },
            {
              name: "Tuấn Kiệt",
              date: "Aug 9, 2025",
              text: "Ban đầu tôi nghi ngờ về việc AI có thể huấn luyện hiệu quả, nhưng sau khi dùng Fitnexus tôi thật sự bất ngờ! Hệ thống gợi ý bài tập cá nhân hoá và hướng dẫn kỹ thuật cực kỳ chuẩn xác.",
            },
            {
              name: "Bảo Nhi",
              date: "Sep 7, 2024",
              text: "Fitnexus giúp tôi theo dõi tiến trình tập luyện, đặt mục tiêu và cải thiện thể lực rõ rệt. Giao diện sạch đẹp, dễ dùng, và tính năng nhắc tập cực kỳ hữu ích!",
            },
            {
              name: "Hữu Đạt",
              date: "Dec, 2024",
              text: "Sau 6 tuần sử dụng, tôi giảm 5kg và tăng 0.5kg cơ! AI Trainer của Fitnexus giúp tôi luyện tập đúng cách và an toàn. Thật sự rất đáng để trải nghiệm!",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#1b2330] p-8 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              {/* Stars */}
              <div className="flex justify-center mb-4 text-teal-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mx-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 17.27l5.18 3.04-1.64-5.81L20 9.75h-6.1L12 4 10.1 9.75H4l4.46 4.75-1.64 5.81L12 17.27z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>

              <p className="mb-6 text-sm italic leading-relaxed text-gray-200">
                “{item.text}”
              </p>

              <div className="text-left">
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-sm text-gray-400">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-28 px-6 md:px-20 bg-gradient-to-br from-blue-200 via-blue-400 to-indigo-400 text-white overflow-hidden rounded-t-[3rem] mt-16 mb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl">
            Sẵn sàng <span className="text-teal-300">thay đổi</span> bản thân?
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-200 md:text-xl">
            Khám phá nền tảng huấn luyện AI giúp bạn đạt phong độ đỉnh cao — từ
            luyện tập, dinh dưỡng đến theo dõi tiến trình cá nhân.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mb-10 md:flex-row">
            <button
              className="px-10 py-4 text-lg font-bold text-blue-700 transition-all duration-300 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => vxpGo("workout", navigate)}
            >
              Đăng ký ngay
            </button>
            <button
              className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 border rounded-full border-white/60 hover:bg-white/10"
              onClick={() => vxpGo("pricing", navigate)}
            >
              Xem gói Premium
            </button>
          </div>

          <div className="flex justify-center mt-10">
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
          </div>

          <p className="mt-6 text-sm tracking-wide text-gray-300 uppercase">
            Fitnexus – Nơi công nghệ và đam mê hội tụ
          </p>
        </div>

        <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 bg-blue-400/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 w-32 h-32 rounded-full left-10 bg-indigo-500/30 blur-3xl animate-pulse"></div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1023] text-gray-300 py-16 px-8 md:px-20 border-t border-gray-800">
        <div className="grid gap-12 mx-auto max-w-7xl md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-2xl font-extrabold text-white">
              Fitnexus
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng huấn luyện thể hình ứng dụng AI đầu tiên tại Việt Nam.
              Theo dõi – Phân tích – Cải thiện — tất cả trong một.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Tính năng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  className="text-left transition hover:text-blue-400"
                  onClick={() => vxpGo("ai", navigate)}
                >
                  AI Trainer
                </button>
              </li>
              <li>
                <button
                  className="text-left transition hover:text-blue-400"
                  onClick={() => vxpGo("workout", navigate)}
                >
                  Luyện tập
                </button>
              </li>
              <li>
                <button
                  className="text-left transition hover:text-blue-400"
                  onClick={() => vxpGo("modeling", navigate)}
                >
                  Mô hình hoá
                </button>
              </li>
              <li>
                <button
                  className="text-left transition hover:text-blue-400"
                  onClick={() => vxpGo("nutrition", navigate)}
                >
                  Dinh dưỡng
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition hover:text-blue-400">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-400">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              Theo dõi chúng tôi
            </h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="#"
                className="flex items-center gap-2 transition hover:text-blue-400"
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a
                href="#"
                className="flex items-center gap-2 transition hover:text-blue-400"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-2 transition hover:text-blue-400"
              >
                <i className="fab fa-youtube"></i> YouTube
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-400">
              © 2025 <span className="font-semibold text-white">Fitnexus</span>.
              All rights reserved.
            </p>
          </div>
        </div>

        {/* Divider line */}
        <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t border-gray-700">
          Designed with ❤️ by Fitnexus Team | Powered by AI & Passion
        </div>
      </footer>
    </div>
  );
}
