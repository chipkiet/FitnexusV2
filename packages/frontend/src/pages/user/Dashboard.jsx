import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import ChatWidget from "../../components/common/ChatWidget.jsx";
import { Flame } from "lucide-react";
import {
  getMyPlansApi,
  listWorkoutSessionsApi,
  getActiveWorkoutSessionApi,
  createWorkoutSessionApi,
  getLoginStreakSummary,
  pingLoginStreak,
} from "../../lib/api.js";

// Dashboard images
import ImgAI from "../../assets/dashboard/AITrainer.png";
import ImgExercise from "../../assets/dashboard/Exercise.png";
import ImgModel from "../../assets/dashboard/Model.png";
import ImgNutrition from "../../assets/dashboard/Nutrition.png";
import { normalize } from "three/src/math/MathUtils.js";
import { raw } from "body-parser";

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
const STREAK_MODAL_KEY = "fnx_streak_modal_date";

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
  const premiumByType =
    user?.user_type && String(user.user_type).toLowerCase() === "premium";
  const premiumByPlan = String(user?.plan || "").toUpperCase() === "PREMIUM";
  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";
  const isPremiumOrAdmin = premiumByType || premiumByPlan || isAdmin;

  // Plans / sessions state
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [completedPlanIds, setCompletedPlanIds] = useState(new Set());
  const [activeSession, setActiveSession] = useState(null);
  const [suggestedPlan, setSuggestedPlan] = useState(null);
  const [continueLoading, setContinueLoading] = useState(true);

  // Streak state
  const [streakState, setStreakState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [showStreakModal, setShowStreakModal] = useState(false);
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat("vi-VN", { weekday: "short" }),
    []
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }),
    []
  );
  const timelineFallback = useMemo(
    () => Array.from({ length: 10 }, () => ({ date: null, active: false })),
    []
  );
  const closeStreakModal = () => setShowStreakModal(false);

  const [weeklyChart, setWeeklyChart] = useState([]);

  const weeklySummary = useMemo(() => {
    if (!weeklyChart || weeklyChart.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayKey = today.toISOString().slice(0, 10);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const byKey = new Map(weeklyChart.map((d) => [d.key, d]));
    const todayCount = byKey.get(todayKey)?.count ?? 0;
    const yesterdayCount = byKey.get(yesterdayKey)?.count ?? 0;
    const diff = todayCount - yesterdayCount;

    const totalWeek = weeklyChart.reduce((sum, d) => sum + d.count, 0);
    const maxCount =
      weeklyChart.reduce((max, d) => (d.count > max ? d.count : max), 0) || 0;

    const weeklyGoal = 6;
    const progress =
      weeklyGoal > 0
        ? Math.min(100, Math.round((totalWeek / weeklyGoal) * 100))
        : 0;
    const n = weeklyChart.length;
    const points = weeklyChart
      .map((d, idx) => {
        const x = n > 1 ? (idx / (n - 1)) * 100 : 50;
        const y = maxCount > 0 ? 100 - (d.count / maxCount) * 100 : 100;
        return `${x}, ${y}`;
      })
      .join(" ");

    return {
      todayCount,
      yesterdayCount,
      diff,
      totalWeek,
      maxCount,
      progress,
      points,
    };
  }, [weeklyChart]);

  // Load plans and completed sessions
  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const res = await getMyPlansApi({ limit: 100, offset: 0 });
        const list = res?.data?.items ?? res?.data ?? [];
        setPlans(Array.isArray(list) ? list : []);
      } catch (e) {
        setPlans([]);
        setPlansError({
          message:
            e?.response?.data?.message ||
            e?.message ||
            "Không tải được kế hoạch",
        });
      }
      try {
        const sess = await listWorkoutSessionsApi({
          status: "completed",
          limit: 100,
          offset: 0,
        });
        const itemsSess = sess?.data?.items ?? sess?.data ?? [];
        const normalizedSessions = Array.isArray(itemsSess) ? itemsSess : [];
        const setIds = new Set(
          normalizedSessions
            .map((s) => s.plan_id)
            .filter((v) => Number.isFinite(v))
        );
        setCompletedPlanIds(setIds);

        const now = new Date();
        const start = new Date();

        start.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        start.setDate(now.getDate() - 6);

        const dayBuckets = [];
        const bucketMap = new Map();

        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          const bucket = { key, date: d, count: 0 };
          dayBuckets.push(bucket);
          bucketMap.set(key, bucket);
        }

        normalizedSessions.forEach((s) => {
          const rawDate =
            s.completed_at ||
            s.end_time ||
            s.ended_at ||
            s.updated_at ||
            s.created_at ||
            s.createdAt ||
            s.updatedAt;
          if (!rawDate) return;

          const d = new Date(rawDate);
          if (Number.isNaN(d.getTime())) return;

          d.setHours(0, 0, 0, 0);
          const key = d.toISOString().slice(0, 10);
          const bucket = bucketMap.get(key);
          if (bucket) {
            bucket.count += 1;
          }
        });

        setWeeklyChart(dayBuckets);
      } catch {}
      setPlansLoading(false);
    };
    loadPlans();
  }, []);

  // Load active session or suggest a plan
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getActiveWorkoutSessionApi();
        const payload = r?.data || r || null;
        const sess = payload?.data || payload;
        if (mounted && (sess?.session_id || sess?.id)) {
          setActiveSession({
            session_id: sess.session_id || sess.id,
            plan_id: sess.plan_id || sess?.plan?.plan_id || null,
            plan_name: sess.plan_name || sess?.plan?.name || "Kế hoạch",
          });
          setContinueLoading(false);
          return;
        }
      } catch {}

      let suggested = null;
      try {
        const raw = sessionStorage.getItem("current_plan_context");
        const ctx = raw ? JSON.parse(raw) : null;
        if (ctx?.plan_id)
          suggested = { plan_id: ctx.plan_id, name: ctx.name || "Kế hoạch" };
      } catch {}
      if (!suggested && Array.isArray(plans) && plans.length > 0) {
        const p = plans[0];
        suggested = { plan_id: p.plan_id, name: p.name || "Kế hoạch" };
      }
      if (mounted) setSuggestedPlan(suggested);
      if (mounted) setContinueLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [plans]);

  // Load streak
  useEffect(() => {
    let mounted = true;
    const loadStreak = async () => {
      let serverTriggered = false;
      try {
        const pingRes = await pingLoginStreak();
        serverTriggered = !!pingRes?.triggered;
      } catch {}
      try {
        const res = await getLoginStreakSummary();
        if (!mounted) return;
        const data = res?.data || null;
        setStreakState({ loading: false, data, error: null });
        if (data?.timeline?.length) {
          const latest = data.timeline[data.timeline.length - 1];
          if (latest.active) {
            let shouldShow = serverTriggered;
            if (!shouldShow) {
              try {
                const stored = localStorage.getItem(STREAK_MODAL_KEY);
                if (stored !== latest.date) {
                  shouldShow = true;
                  localStorage.setItem(STREAK_MODAL_KEY, latest.date);
                }
              } catch {
                shouldShow = true;
              }
            } else {
              try {
                localStorage.setItem(STREAK_MODAL_KEY, latest.date);
              } catch {}
            }
            if (shouldShow) setShowStreakModal(true);
          }
        }
      } catch (error) {
        if (!mounted) return;
        setStreakState({
          loading: false,
          data: null,
          error:
            error?.response?.data?.message ||
            error?.message ||
            "Không tải được dữ liệu streak",
        });
      }
    };
    loadStreak();
    return () => {
      mounted = false;
    };
  }, []);

  const handleContinueWorkout = async () => {
    if (continueLoading) return;
    try {
      if (activeSession?.session_id) {
        navigate(`/workout-run/${activeSession.session_id}`);
        return;
      }
      if (suggestedPlan?.plan_id) {
        const res = await createWorkoutSessionApi({
          plan_id: suggestedPlan.plan_id,
          notes: "",
        });
        const sid =
          res?.data?.session_id || res?.session_id || res?.data?.id || null;
        if (sid) {
          navigate(`/workout-run/${sid}`);
          return;
        }
      }
      navigate("/plans/select");
    } catch {
      navigate("/plans/select");
    }
  };

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
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/70"></div>
        </div>
        <div className="z-10 space-y-6 text-center md:w-1/2 md:text-left">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Trải nghiệm <span className="text-blue-400">AI Workout</span>
            <br />
            cùng Fitnexus
          </h1>
          <p className="max-w-lg text-lg text-gray-300">
            Kết hợp AI, mô hình hoá chuyển động, dinh dưỡng và cộng đồng giúp
            bạn luyện tập hiệu quả hơn mỗi ngày.
          </p>
          <div className="flex justify-center gap-4 md:justify-start">
            <button
              className="px-8 py-3 font-semibold bg-blue-400 rounded-lg hover:bg-blue-600"
              onClick={handleContinueWorkout}
              disabled={continueLoading}
            >
              {continueLoading
                ? "Đang kiểm tra buổi tập..."
                : activeSession?.session_id
                ? `Tiếp tục buổi tập — ${
                    activeSession?.plan_name || "Kế hoạch"
                  }`
                : suggestedPlan?.plan_id
                ? `Bắt đầu buổi tập — ${suggestedPlan?.name || "Kế hoạch"}`
                : "Chọn kế hoạch để bắt đầu"}
            </button>
            <button
              className="px-8 py-3 font-semibold border border-blue-400 rounded-lg hover:bg-blue-400/10"
              onClick={() => vxpGo("pricing", navigate)}
              style={{ display: isPremiumOrAdmin ? "none" : undefined }}
            >
              Nâng cấp Premium
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: 30% Achievements / 70% Navigation */}
      <section className="px-8 py-12 bg-white md:px-20">
        <div className="grid gap-6 md:grid-cols-10">
          {/* Left 30%: Thành tựu / Kế hoạch / Streak */}
          <aside className="space-y-5 md:col-span-3">
            {/* Hero metric */}
            {/* Hero metric: Thành tựu hôm nay + biểu đồ 7 ngày */}
            <div className="p-5 border rounded-xl border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Thành tựu hôm nay
                </h3>
                <span className="text-[11px] text-slate-500">
                  7 ngày gần đây
                </span>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {weeklySummary ? weeklySummary.todayCount : "—"}
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  {weeklySummary ? (
                    weeklySummary.diff === 0 ? (
                      <>Tương đương hôm qua</>
                    ) : weeklySummary.diff > 0 ? (
                      <>Cao hơn hôm qua {weeklySummary.diff} buổi</>
                    ) : (
                      <>Thấp hơn hôm qua {Math.abs(weeklySummary.diff)} buổi</>
                    )
                  ) : (
                    <>So với hôm qua: —</>
                  )}
                </div>

                {/* Biểu đồ cột + đường line */}
                <div className="relative mt-4">
                  {weeklyChart && weeklyChart.length > 0 ? (
                    <>
                      <div className="flex items-end h-24 gap-1.5">
                        {weeklyChart.map((d) => {
                          const max = weeklySummary?.maxCount || 0;
                          const ratio = max > 0 ? d.count / max : 0;
                          const barHeight = ratio > 0 ? ratio * 100 : 4; // tối thiểu 4% để còn thấy cột

                          const dayLabel = weekdayFormatter.format(d.date); // T2, T3,...
                          return (
                            <div
                              key={d.key}
                              className="flex flex-col items-center justify-end flex-1"
                            >
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-400"
                                style={{ height: `${barHeight}%` }}
                              ></div>
                              <span className="mt-1 text-[10px] text-slate-500">
                                {dayLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Line chart overlay */}
                      {weeklySummary?.points && (
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-x-0 w-full h-16 pointer-events-none bottom-7"
                        >
                          <polyline
                            fill="none"
                            stroke="rgba(59,130,246,0.9)"
                            strokeWidth="1.5"
                            points={weeklySummary.points}
                          />
                        </svg>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-xs text-slate-500">
                      Chưa có buổi tập hoàn thành trong 7 ngày gần đây.
                    </div>
                  )}
                </div>

                {/* Progress bar theo tổng tuần / mục tiêu 5 buổi */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{
                      width: weeklySummary
                        ? `${weeklySummary.progress}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {weeklySummary ? (
                    <>
                      Tuần này: {weeklySummary.totalWeek} buổi · Mục tiêu 5 buổi
                      /tuần
                    </>
                  ) : (
                    <>Tiến độ đạt mục tiêu: —%</>
                  )}
                </div>
              </div>
            </div>

            {/* Kế hoạch đã hoàn thành */}
            <div className="p-5 bg-white border rounded-xl border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Kế hoạch đã hoàn thành
                </h3>
                <button
                  onClick={() => navigate("/plans/select")}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="mt-3">
                {plansError && (
                  <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded p-2">
                    {plansError.message}
                  </div>
                )}
                {plansLoading ? (
                  <div className="text-xs text-slate-500">
                    Đang tải kế hoạch...
                  </div>
                ) : (
                  (() => {
                    const completed = (plans || []).filter((p) =>
                      completedPlanIds.has(p.plan_id)
                    );
                    if (completed.length === 0)
                      return (
                        <div className="text-xs text-slate-500">
                          Chưa có kế hoạch hoàn thành
                        </div>
                      );
                    return (
                      <ul className="space-y-2.5">
                        {completed.slice(0, 3).map((p) => (
                          <li
                            key={p.plan_id}
                            className="p-3 border rounded-lg border-slate-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate text-slate-800">
                                  {p.name || "(Không có tên)"}
                                </div>
                                {p.description && (
                                  <div className="text-[11px] text-slate-600 truncate">
                                    {p.description}
                                  </div>
                                )}
                                {p.difficulty_level && (
                                  <div className="text-[11px] text-slate-500">
                                    Độ khó: {p.difficulty_level}
                                  </div>
                                )}
                                <div className="mt-1 text-[11px] text-green-600">
                                  Đã hoàn thành
                                </div>
                              </div>
                              <button
                                type="button"
                                className="shrink-0 px-2.5 py-1 text-[11px] text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                                onClick={() => navigate(`/plans/${p.plan_id}`)}
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Streak */}
            <div className="p-5 bg-white border rounded-xl border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Chuỗi ngày (Streak)
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Hiện tại:{" "}
                    <span className="font-semibold text-slate-900">
                      {streakState.data?.currentStreak ?? 0} ngày
                    </span>{" "}
                    · Kỷ lục:{" "}
                    <span className="font-semibold text-slate-900">
                      {streakState.data?.bestStreak ?? 0} ngày
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="w-5 h-5" />
                  <span className="text-3xl font-bold text-slate-900">
                    {streakState.data?.currentStreak ?? 0}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                {streakState.loading ? (
                  <div className="grid grid-cols-10 gap-1.5 animate-pulse">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-16 border rounded-2xl bg-slate-100 border-slate-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-10 gap-1.5">
                    {(streakState.data?.timeline?.length
                      ? streakState.data.timeline
                      : timelineFallback
                    ).map((day, idx) => {
                      const dateObj = day.date ? new Date(day.date) : null;
                      const dayLabel = dateObj
                        ? weekdayFormatter.format(dateObj)
                        : "--";
                      const dateLabel = dateObj
                        ? dateFormatter.format(dateObj)
                        : "--";
                      return (
                        <div
                          key={day.date || `empty-${idx}`}
                          className={`flex flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center ${
                            day.active
                              ? "border-transparent bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 shadow"
                              : "border-dashed border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wide">
                            {dayLabel}
                          </span>
                          <span className="text-sm font-semibold">
                            {dateLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {streakState.error ? (
                <div className="mt-3 text-xs text-rose-500">
                  {streakState.error}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-500">
                  Luyện tập mỗi ngày để duy trì chuỗi streak và mở khoá huy
                  hiệu.
                </div>
              )}
            </div>
          </aside>

          {/* Right 70%: Điều hướng tính năng + ảnh */}
          <main className="space-y-5 md:col-span-7">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Khám phá các tính năng nổi bật của Fitnexus
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* AI Trainer */}
              <button
                type="button"
                onClick={() => vxpGo("ai", navigate)}
                className="overflow-hidden text-left transition bg-white border shadow-sm group rounded-xl border-slate-200 hover:border-blue-400"
              >
                <div className="p-4">
                  <div className="font-semibold text-slate-900">AI Trainer</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Trợ lý luyện tập phân tích và hướng dẫn kỹ thuật.
                  </div>
                </div>
                <div className="flex items-center justify-center p-0 bg-white border-t h-72 md:h-[28rem] border-slate-200">
                  <img
                    src={ImgAI}
                    alt="AI Trainer"
                    className="object-contain w-full h-full"
                  />
                </div>
              </button>

              {/* Luyện tập */}
              <button
                type="button"
                onClick={() => vxpGo("workout", navigate)}
                className="overflow-hidden text-left transition bg-white border shadow-sm group rounded-xl border-slate-200 hover:border-blue-400"
              >
                <div className="p-4">
                  <div className="font-semibold text-slate-900">Luyện tập</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Chương trình phù hợp từng nhóm cơ và cấp độ.
                  </div>
                </div>
                <div className="flex items-center justify-center p-0 bg-white border-t h-72 md:h-[28rem] border-slate-200">
                  <img
                    src={ImgExercise}
                    alt="Luyện tập"
                    className="object-contain w-full h-full"
                  />
                </div>
              </button>

              {/* Mô hình hoá */}
              <button
                type="button"
                onClick={() => vxpGo("modeling", navigate)}
                className="overflow-hidden text-left transition bg-white border shadow-sm group rounded-xl border-slate-200 hover:border-blue-400"
              >
                <div className="p-4">
                  <div className="font-semibold text-slate-900">
                    Mô hình hoá
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Phân tích chuyển động 3D để tối ưu hiệu quả.
                  </div>
                </div>
                <div className="flex items-center justify-center p-0 bg-white border-t h-72 md:h-[28rem] border-slate-200">
                  <img
                    src={ImgModel}
                    alt="Mô hình hoá"
                    className="object-contain w-full h-full"
                  />
                </div>
              </button>

              {/* Dinh dưỡng */}
              <button
                type="button"
                onClick={() => vxpGo("nutrition", navigate)}
                className="overflow-hidden text-left transition bg-white border shadow-sm group rounded-xl border-slate-200 hover:border-blue-400"
              >
                <div className="p-4">
                  <div className="font-semibold text-slate-900">Dinh dưỡng</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Theo dõi khẩu phần và gợi ý bữa ăn theo mục tiêu.
                  </div>
                </div>
                <div className="flex items-center justify-center p-0 bg-white border-t h-72 md:h-[28rem] border-slate-200">
                  <img
                    src={ImgNutrition}
                    alt="Dinh dưỡng"
                    className="object-contain w-full h-full"
                  />
                </div>
              </button>

              {/* Cộng đồng */}
              <button
                type="button"
                onClick={() => vxpGo("community", navigate)}
                className="overflow-hidden text-left transition bg-white border shadow-sm group rounded-xl border-slate-200 hover:border-blue-400 md:col-span-2"
              >
                <div className="p-4">
                  <div className="font-semibold text-slate-900">Cộng đồng</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Kết nối, chia sẻ kinh nghiệm và tham gia thử thách.
                  </div>
                </div>
              </button>
            </div>
          </main>
        </div>
      </section>

      {/* REVIEWS: placeholder (no fake data) */}
      <section className="px-8 py-16 bg-white md:px-20">
        <div className="p-6 mx-auto border max-w-7xl rounded-2xl border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Đánh giá từ cộng đồng
            </h2>
            <button
              onClick={() => vxpGo("community", navigate)}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Xem tất cả đánh giá
            </button>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-center bg-white border-2 border-dashed h-36 rounded-xl border-slate-300 text-slate-500">
              Chưa có đánh giá hiển thị. Chức năng đánh giá sẽ được bổ sung,
              hiển thị dữ liệu thật.
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
            <button
              className="px-10 py-4 text-lg font-bold text-blue-700 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105"
              onClick={handleContinueWorkout}
            >
              Bắt đầu tập luyện ngay
            </button>
            <button
              className="px-10 py-4 text-lg font-semibold text-white border rounded-full border-white/60 hover:bg-white/10"
              onClick={() => vxpGo("pricing", navigate)}
            >
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
            <h3 className="mb-3 text-2xl font-extrabold text-white">
              Fitnexus
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng huấn luyện thế hệ mới ứng dụng AI. Theo dõi - Phân tích -
              Cải thiện — tất cả trong một.
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
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              Theo dõi chúng tôi
            </h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="#" className="transition hover:text-blue-400">
                Facebook
              </a>
              <a href="#" className="transition hover:text-blue-400">
                Instagram
              </a>
              <a href="#" className="transition hover:text-blue-400">
                YouTube
              </a>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              © 2025 Fitnexus. All rights reserved.
            </p>
          </div>
        </div>
        <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t border-gray-700">
          Designed by Fitnexus Team | Powered by AI & Passion
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />

      {showStreakModal && streakState.data?.currentStreak ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/50">
          <div className="relative w-full max-w-md p-8 overflow-hidden bg-white border shadow-2xl rounded-3xl border-slate-100">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-amber-100 via-white to-blue-100 opacity-60"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-inner bg-amber-100 text-amber-600">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-center text-slate-900">
                Chuỗi {streakState.data.currentStreak} ngày!
              </h3>
              <p className="mt-3 text-center text-slate-600">
                Tuyệt vời! Bạn đã đăng nhập liên tiếp trong{" "}
                <span className="font-semibold text-slate-900">
                  {streakState.data.currentStreak}
                </span>{" "}
                ngày. Hãy giữ vững phong độ để phá kỷ lục cá nhân
                {streakState.data.bestStreak > streakState.data.currentStreak
                  ? ` (${streakState.data.bestStreak} ngày).`
                  : " nhé!"}
              </p>
              <div className="flex justify-center mt-6">
                <button
                  onClick={closeStreakModal}
                  className="px-6 py-2 font-semibold text-white shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-xl"
                >
                  Tiếp tục luyện tập
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

