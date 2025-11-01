import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { Dumbbell, Users, Brain, Apple } from "lucide-react";
import gymhero from "../../assets/gymhero.png";

/* ===== VXP helpers: ưu tiên trigger nút trên Navbar qua data-nav, fallback navigate ===== */
const VXP_ROUTE_MAP = {
  home: "/",
  modeling: "/modeling-preview",
  workout: "/exercises",        // ⬅ đi thẳng vào trang bài tập
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

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-800">
      {/* HEADER */}
      <HeaderLogin />

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 bg-gradient-to-r from-[#0b1023] via-[#101735] to-[#162142] text-white rounded-b-[3rem]">
        <div className="md:w-1/2 space-y-6 text-center md:text-left z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Complete <span className="text-blue-400">AI Workout</span> <br />
            Experience with Fitnexus
          </h1>
          <p className="text-gray-300 text-lg max-w-lg">
            Kết hợp AI, mô hình hoá chuyển động, dinh dưỡng và cộng đồng năng
            động giúp bạn tập luyện hiệu quả hơn mỗi ngày.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <button
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold"
              onClick={() => vxpGo("workout", navigate)}
            >
              Bắt đầu miễn phí
            </button>
            <button
              className="border border-blue-400 hover:bg-blue-400/10 px-8 py-3 rounded-lg font-semibold"
              onClick={() => vxpGo("pricing", navigate)}
            >
              Nâng cấp Premium
            </button>
          </div>
        </div>

        {/* Placeholder ảnh */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <div className="relative w-[380px] h-[380px] rounded-full overflow-hidden shadow-2xl ring-4 ring-blue-500/30">
            <img
              src={gymhero}
              alt="AI Gym Hero"
              className="object-cover w-full h-full scale-110 hover:scale-125 transition-transform duration-700 ease-out"
            />
            {/* Hiệu ứng ánh sáng */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
      </section>

      {/* ABOUT / FEATURES */}
      <section className="px-8 md:px-20 py-16 text-center bg-white">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Giới thiệu về <span className="text-blue-600">Fitnexus</span>
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed mb-12">
          Fitnexus là nền tảng tập luyện thế hệ mới giúp bạn đạt được hiệu quả
          tối đa với AI Trainer, mô hình hóa chuyển động và kế hoạch dinh dưỡng
          cá nhân. Dù bạn mới bắt đầu hay đã là dân gym lâu năm, Fitnexus sẽ
          đồng hành cùng bạn trên hành trình phát triển toàn diện.
        </p>

        {/* FEATURES SECTION */}
        <section className="px-6 md:px-20 py-10 bg-white text-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Khám phá các tính năng nổi bật của{" "}
            <span className="text-blue-600">Fitnexus</span>
          </h2>

          <div className="grid md:grid-cols-5 gap-6 text-sm">
            {/* AI */}
            <button
              type="button"
              onClick={() => vxpGo("modeling", navigate)}
              className="bg-gray-50 hover:bg-blue-50 transition rounded-xl p-5 border border-gray-200 hover:border-blue-400 text-left cursor-pointer"
            >
              <Brain size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2 text-center">
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
              className="bg-gray-50 hover:bg-blue-50 transition rounded-xl p-5 border border-gray-200 hover:border-blue-400 text-left cursor-pointer"
            >
              <Dumbbell size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2 text-center">
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
              className="bg-gray-50 hover:bg-blue-50 transition rounded-xl p-5 border border-gray-200 hover:border-blue-400 text-left cursor-pointer"
            >
              <Brain size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2 text-center">
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
              className="bg-gray-50 hover:bg-blue-50 transition rounded-xl p-5 border border-gray-200 hover:border-blue-400 text-left cursor-pointer"
            >
              <Apple size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2 text-center">
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
              className="bg-gray-50 hover:bg-blue-50 transition rounded-xl p-5 border border-gray-200 hover:border-blue-400 text-left cursor-pointer"
            >
              <Users size={28} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2 text-center">
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
      <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-100 px-8 md:px-20 py-24 text-center overflow-hidden">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Gói dịch vụ <span className="text-blue-600">Fitnexus</span>
        </h2>
        <p className="text-gray-600 mb-14 max-w-2xl mx-auto">
          Lựa chọn gói tập luyện phù hợp với bạn — từ cơ bản miễn phí đến
          Premium chuyên nghiệp với AI thông minh và báo cáo nâng cao.
        </p>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto relative z-10">
          {/* Gói Free */}
          <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-[1.02]">
            <div className="absolute -top-3 left-6 bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              Gói cơ bản
            </div>
            <div className="p-10 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gói Free</h3>
              <p className="text-gray-500 text-sm mb-6">
                Trải nghiệm Fitnexus cơ bản — phù hợp cho người mới bắt đầu làm
                quen với AI Workout.
              </p>
              <h4 className="text-4xl font-extrabold text-blue-600 mb-4">0₫</h4>

              <ul className="text-gray-600 text-sm space-y-2 text-left mb-8">
                <li>✅ Truy cập AI cơ bản</li>
                <li>✅ Theo dõi bài tập & lịch luyện</li>
                <li>🚫 Không có phân tích chuyên sâu</li>
                <li>🚫 Không có gợi ý dinh dưỡng cá nhân hoá</li>
              </ul>

              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition"
                onClick={() => vxpGo("workout", navigate)}
              >
                Dùng miễn phí
              </button>
            </div>
          </div>

          {/* Gói Premium */}
          <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl text-white border border-blue-400 hover:scale-105 transition-all duration-300">
            {/* Ribbon */}
            <div className="absolute -top-3 right-6 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Best Choice
            </div>

            <div className="p-12 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-white mb-3">Gói Premium</h3>
              <p className="text-gray-200 text-sm mb-6 max-w-sm">
                Dành cho người muốn bứt phá – phân tích tư thế 3D, gợi ý chế độ
                ăn, và huấn luyện viên AI chuyên nghiệp.
              </p>
              <h4 className="text-5xl font-extrabold text-yellow-300 mb-4">
                199.000₫
                <span className="text-lg font-medium text-gray-200">/tháng</span>
              </h4>

              <ul className="text-gray-100 text-sm space-y-2 text-left mb-8">
                <li>✨ Toàn bộ tính năng Free</li>
                <li>✨ Phân tích tư thế 3D bằng AI</li>
                <li>✨ Báo cáo chi tiết tiến trình luyện tập</li>
                <li>✨ Gợi ý dinh dưỡng cá nhân hoá</li>
                <li>✨ Trợ lý AI Trainer chuyên nghiệp</li>
              </ul>

              <button
                className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-lg font-extrabold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition"
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

      {/* TESTIMONIALS */}
      <section className="px-8 md:px-20 py-20 text-center bg-[#0d1117] text-white">
        <h2 className="text-4xl font-bold text-white mb-12">
          Người dùng nói gì về <span className="text-teal-400">Fitnexus</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            {
              name: "Minh Anh",
              date: "Aug 11, 2025",
              text:
                "Ứng dụng này đã thay đổi hoàn toàn cách tôi luyện tập. Các bài tập mới mẻ, hướng dẫn video rõ ràng và gợi ý dinh dưỡng thông minh giúp tôi duy trì thói quen tập luyện mỗi ngày.",
            },
            {
              name: "Tuấn Kiệt",
              date: "Aug 9, 2025",
              text:
                "Ban đầu tôi nghi ngờ về việc AI có thể huấn luyện hiệu quả, nhưng sau khi dùng Fitnexus tôi thật sự bất ngờ! Hệ thống gợi ý bài tập cá nhân hoá và hướng dẫn kỹ thuật cực kỳ chuẩn xác.",
            },
            {
              name: "Bảo Nhi",
              date: "Sep 7, 2024",
              text:
                "Fitnexus giúp tôi theo dõi tiến trình tập luyện, đặt mục tiêu và cải thiện thể lực rõ rệt. Giao diện sạch đẹp, dễ dùng, và tính năng nhắc tập cực kỳ hữu ích!",
            },
            {
              name: "Hữu Đạt",
              date: "Dec, 2024",
              text:
                "Sau 6 tuần sử dụng, tôi giảm 5kg và tăng 0.5kg cơ! AI Trainer của Fitnexus giúp tôi luyện tập đúng cách và an toàn. Thật sự rất đáng để trải nghiệm!",
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

              <p className="text-gray-200 text-sm mb-6 leading-relaxed italic">
                “{item.text}”
              </p>

              <div className="text-left">
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-gray-400 text-sm">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-28 px-6 md:px-20 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white overflow-hidden rounded-t-[3rem] mt-16 mb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Sẵn sàng <span className="text-teal-300">thay đổi</span> bản thân?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-12">
            Khám phá nền tảng huấn luyện AI giúp bạn đạt phong độ đỉnh cao —
            từ luyện tập, dinh dưỡng đến theo dõi tiến trình cá nhân.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <button
              className="bg-white text-blue-700 px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              onClick={() => vxpGo("workout", navigate)}
            >
              Đăng ký ngay
            </button>
            <button
              className="border border-white/60 hover:bg-white/10 px-10 py-4 rounded-full text-lg font-semibold text-white transition-all duration-300"
              onClick={() => vxpGo("pricing", navigate)}
            >
              Xem gói Premium
            </button>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"></div>
          </div>

          <p className="mt-6 text-sm text-gray-300 tracking-wide uppercase">
            Fitnexus – Nơi công nghệ và đam mê hội tụ 💪
          </p>
        </div>

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-indigo-500/30 blur-3xl rounded-full animate-pulse"></div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b1023] text-gray-300 py-16 px-8 md:px-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-3">Fitnexus</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng huấn luyện thể hình ứng dụng AI đầu tiên tại Việt Nam.
              Theo dõi – Phân tích – Cải thiện — tất cả trong một.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Tính năng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  className="hover:text-blue-400 transition text-left"
                  onClick={() => vxpGo("modeling", navigate)}
                >
                  AI Trainer
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-400 transition text-left"
                  onClick={() => vxpGo("workout", navigate)}
                >
                  Luyện tập
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-400 transition text-left"
                  onClick={() => vxpGo("modeling", navigate)}
                >
                  Mô hình hoá
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-400 transition text-left"
                  onClick={() => vxpGo("nutrition", navigate)}
                >
                  Dinh dưỡng
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Theo dõi chúng tôi
            </h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="#"
                className="hover:text-blue-400 transition flex items-center gap-2"
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition flex items-center gap-2"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition flex items-center gap-2"
              >
                <i className="fab fa-youtube"></i> YouTube
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-400">
              © 2025 <span className="text-white font-semibold">Fitnexus</span>.
              All rights reserved.
            </p>
          </div>
        </div>

        {/* Divider line */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          Designed with ❤️ by Fitnexus Team | Powered by AI & Passion
        </div>
      </footer>
    </div>
  );
}
