// packages/frontend/src/components/dashboard/DashboardHero.jsx

import React, { useState, useEffect } from "react";
import { getSystemContentApi } from "../../lib/api";
import { PlayCircle, Loader2 } from "lucide-react";

const DEFAULT_CONTENT = {
  mediaType: "video",
  mediaUrl: "/vidbgr.mp4",
  title: "Chào mừng đến với <span class='text-blue-400'>Fitnexus</span>",
  description: "Hệ thống luyện tập thông minh đang chờ dữ liệu...",
  buttonText: "Khám phá ngay",
  showButton: true,
};

export default function DashboardHero({
  onContinue,
  continueLoading,
  activeSession,
  onPremiumClick,
  isPremiumOrAdmin,
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Thêm timestamp để tránh Cache trình duyệt (QUAN TRỌNG)
    const timestamp = new Date().getTime();

    // Gọi API trực tiếp axios ở đây hoặc sửa trong api.js để nhận params
    // Ở đây mình giả định getSystemContentApi gọi đúng endpoint
    getSystemContentApi(`dashboard_hero?t=${timestamp}`)
      .then((res) => {
        if (res.success && res.data) {
          setContent(res.data);
        } else {
          setContent(DEFAULT_CONTENT);
        }
      })
      .catch((err) => {
        console.error(err);
        setContent(DEFAULT_CONTENT);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="w-full h-[500px] bg-slate-900 animate-pulse rounded-b-[3rem]" />
    );

  // Fallback an toàn nếu content null
  const safeContent = content || DEFAULT_CONTENT;

  // Logic tự đoán loại file nếu DB thiếu field mediaType
  const isVideo =
    safeContent.mediaType === "video" ||
    (safeContent.mediaUrl && safeContent.mediaUrl.match(/\.(mp4|webm|mov)$/i));

  return (
    <section className="relative flex items-center justify-center px-6 overflow-hidden bg-slate-900 rounded-b-[3rem] text-white" style={{ minHeight: "80vh", paddingBlock: "var(--section-spacing)" }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <video
            // QUAN TRỌNG: Key thay đổi giúp React biết phải load lại video mới
            key={safeContent.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full transition-opacity duration-700 ease-in-out opacity-100"
          >
            <source src={safeContent.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            key={safeContent.mediaUrl}
            src={safeContent.mediaUrl}
            alt="Hero BG"
            className="object-cover w-full h-full opacity-100"
            onError={(e) => (e.target.style.display = "none")} // Ẩn nếu ảnh lỗi
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto" style={{ maxWidth: "var(--container-width)" }}>
        <div className="w-full space-y-8 text-center duration-700 md:w-3/5 md:text-left animate-in fade-in slide-in-from-left-5">
          <h1
            className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl drop-shadow-xl shadow-black"
            dangerouslySetInnerHTML={{ __html: safeContent.title }}
          />
          <p className="max-w-xl text-lg font-medium leading-relaxed text-gray-200 md:text-xl drop-shadow-md">
            {safeContent.description}
          </p>
          {safeContent.showButton && (
            <div className="flex flex-wrap justify-center gap-4 pt-4 md:justify-start">
              <button
                onClick={onContinue}
                disabled={continueLoading}
                className="flex items-center gap-3 px-10 py-5 text-lg font-bold text-black transition-transform bg-white rounded-full shadow-xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {continueLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {activeSession?.session_id
                      ? `Tiếp tục: ${activeSession.plan_name}`
                      : safeContent.buttonText || "Bắt đầu ngay"}
                    <PlayCircle className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {!isPremiumOrAdmin && (
                <button
                  onClick={onPremiumClick}
                  className="px-10 py-5 text-lg font-bold text-white transition-colors border border-white/30 rounded-full hover:bg-white/10 backdrop-blur-sm"
                >
                  Gói Premium
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
