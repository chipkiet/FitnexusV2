// packages/frontend/src/pages/dashboard/DashboardHero.jsx

import React, { useState, useEffect } from "react";
import { getSystemContentApi } from "../../lib/api";
import { PlayCircle, Loader2, Sparkles } from "lucide-react";

const DEFAULT_CONTENT = {
  mediaType: "image",
  mediaUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  title: "AI Training with Fitnexus",
  description: "Experience personalized, data-driven workouts engineered by advanced AI to help you achieve your fitness goals faster.",
  buttonText: "Start Now",
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
    const timestamp = new Date().getTime();

    getSystemContentApi(`dashboard_hero?t=${timestamp}`)
      .then((res) => {
        if (res.success && res.data) {
          // Merge API data with default to ensure we have the required title if API is missing it
          setContent({ ...DEFAULT_CONTENT, ...res.data, title: res.data.title || DEFAULT_CONTENT.title });
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
      <div className="w-full h-[600px] bg-slate-900 animate-pulse" />
    );

  const safeContent = content || DEFAULT_CONTENT;

  // Since requirement says text must be "AI Training with Fitnexus", we enforce it here or use safeContent.title
  const finalTitle = "AI Training with Fitnexus";

  const isVideo =
    safeContent.mediaType === "video" ||
    (safeContent.mediaUrl && safeContent.mediaUrl.match(/\.(mp4|webm|mov)$/i));

  return (
    <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 border-b border-white/10">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <video
            key={safeContent.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
          >
            <source src={safeContent.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            key={safeContent.mediaUrl}
            src={safeContent.mediaUrl}
            alt="Fitness Background"
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_CONTENT.mediaUrl;
            }}
          />
        )}
        {/* Dark Overlay for High Contrast */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-6 mx-auto max-w-7xl md:px-12">
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Fitness</span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl drop-shadow-2xl">
            {finalTitle}
          </h1>

          <p className="max-w-xl text-lg text-gray-300 md:text-xl drop-shadow-lg font-medium leading-relaxed">
            {safeContent.description}
          </p>

          {safeContent.showButton && (
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <button
                onClick={onContinue}
                disabled={continueLoading}
                className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-full hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {continueLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {activeSession?.session_id
                      ? `Continue: ${activeSession.plan_name}`
                      : "Start Now"}
                    <PlayCircle className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {!isPremiumOrAdmin && (
                <button
                  onClick={onPremiumClick}
                  className="px-8 py-4 text-base font-bold text-white transition-all border-2 border-white/80 rounded-full hover:bg-white hover:text-black hover:border-white active:scale-95 backdrop-blur-sm"
                >
                  Premium Package
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
