import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import ChatWidget from "../../components/common/ChatWidget.jsx";
import { Flame, MessageCircle, Star, ThumbsUp } from "lucide-react";
import {
  getMyPlansApi,
  listWorkoutSessionsApi,
  getActiveWorkoutSessionApi,
  createWorkoutSessionApi,
  getLoginStreakSummary,
  pingLoginStreak,
  fetchDashboardReviewsApi,
  createDashboardReviewApi,
  createDashboardReviewCommentApi,
  toggleDashboardReviewHelpfulApi,
  updateDashboardReviewCommentApi,
  deleteDashboardReviewCommentApi,
  deleteDashboardReviewApi,
} from "../../lib/api.js";

// Dashboard images
import ImgAI from "../../assets/dashboard/AITrainer.png";
import ImgExercise from "../../assets/dashboard/Exercise.png";
import ImgModel from "../../assets/dashboard/Model.png";
import ImgNutrition from "../../assets/dashboard/Nutrition.png";

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
const DEFAULT_RATING_COUNTS = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const getInitials = (name = "") => {
  const parts = String(name || "")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!parts.length) return "??";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] || "" : "";
  return (first + last).toUpperCase();
};

const renderAvatar = (url, name, className = "w-12 h-12") => {
  if (url) {
    return <img src={url} alt={name || "avatar"} className={`${className} rounded-full object-cover`} />;
  }
  return (
    <div className={`${className} rounded-full bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center`}>
      {getInitials(name)}
    </div>
  );
};

const isBlobUrl = (url = "") => typeof url === "string" && url.startsWith("blob:");

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
  const premiumByType = user?.user_type && String(user.user_type).toLowerCase() === "premium";
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

  const [streakState, setStreakState] = useState({ loading: true, data: null, error: null });
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState("recent");
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingCounts: { ...DEFAULT_RATING_COUNTS },
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    headline: "",
    program: "",
    tags: "",
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ error: null, success: null });
  const [reviewUploads, setReviewUploads] = useState([]);
  const [reviewPreviews, setReviewPreviews] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentUploads, setCommentUploads] = useState({});
  const [commentPreviews, setCommentPreviews] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [helpfulLoading, setHelpfulLoading] = useState({});
  const [commentMenus, setCommentMenus] = useState(null);
  const [commentEditing, setCommentEditing] = useState({});
  const [reviewMenus, setReviewMenus] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const reviewFormRef = useRef(null);
  const currentUserName = useMemo(
    () => user?.full_name || user?.name || user?.username || user?.email?.split("@")[0] || "Thành viên ẩn danh",
    [user]
  );
  const isCurrentUserAdmin = useMemo(() => String(user?.role || "").toUpperCase() === "ADMIN", [user]);

  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat("vi-VN", { weekday: "short" }), []);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }), []);
  const reviewDateFormatter = useMemo(
    () => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }),
    []
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const timelineFallback = useMemo(() => Array.from({ length: 10 }, () => ({ date: null, active: false })), []);
  const closeStreakModal = () => setShowStreakModal(false);
  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviewStats.ratingCounts?.[star] ?? 0;
      const percentage = reviewStats.totalReviews ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviewStats]);
  const trendingTags = useMemo(() => {
    const tagCounts = {};
    reviews.forEach((review) => {
      (review.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag, count]) => ({ tag, count }));
  }, [reviews]);
  const filteredReviews = useMemo(() => reviews, [reviews]);
  useEffect(() => {
    return () => {
      Object.values(commentPreviews).forEach((list) => {
        (list || []).forEach((preview) => {
          try {
            URL.revokeObjectURL(preview.url);
          } catch {}
        });
      });
    };
  }, [commentPreviews]);
  useEffect(() => {
    return () => {
      Object.values(commentEditing).forEach((state) => {
        (state?.previews || []).forEach((preview) => {
          try {
            URL.revokeObjectURL(preview.url);
          } catch {}
        });
      });
    };
  }, [commentEditing]);
  useEffect(() => {
    return () => {
      reviewPreviews.forEach((preview) => {
        try {
          if (isBlobUrl(preview.url)) URL.revokeObjectURL(preview.url);
        } catch {}
      });
    };
  }, [reviewPreviews]);
  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await fetchDashboardReviewsApi({
        limit: 20,
        rating: ratingFilter || undefined,
        sort: sortBy === "helpful" ? "helpful" : "recent",
      });
      const payload = response?.data || response;
      const normalizedItems = (payload?.items || []).map((item) => ({
        ...item,
        comments: Array.isArray(item.comments) ? item.comments : [],
      }));
      setReviews(normalizedItems);
      setReviewsTotal(payload?.total || 0);
      const stats = payload?.stats || {};
      setReviewStats({
        totalReviews: Number(stats.totalReviews || 0),
        averageRating: Number(stats.averageRating || 0),
        ratingCounts: {
          1: Number(stats.ratingCounts?.[1] || 0),
          2: Number(stats.ratingCounts?.[2] || 0),
          3: Number(stats.ratingCounts?.[3] || 0),
          4: Number(stats.ratingCounts?.[4] || 0),
          5: Number(stats.ratingCounts?.[5] || 0),
        },
      });
    } catch (error) {
      setReviews([]);
      setReviewsTotal(0);
      setReviewStats({ totalReviews: 0, averageRating: 0, ratingCounts: { ...DEFAULT_RATING_COUNTS } });
      setReviewsError(error?.response?.data?.message || error?.message || "Không tải được đánh giá");
    } finally {
      setReviewsLoading(false);
    }
  }, [ratingFilter, sortBy]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);
  const toggleRatingFilter = (value) => {
    setRatingFilter((prev) => (prev === value ? 0 : value));
  };
  const renderStars = (value) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const active = idx < Math.round(value);
        return (
          <Star
            key={idx}
            className={`w-4 h-4 ${active ? "text-amber-400 fill-amber-400" : "text-slate-300"} stroke-[1.5px]`}
          />
        );
      })}
    </div>
  );
  const handleReviewFieldChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
    setReviewMessage({ error: null, success: null });
  };
  const handleReviewFilesChange = (files) => {
    const list = Array.from(files || []).slice(0, 3);
    reviewPreviews.forEach((preview) => {
      try {
        URL.revokeObjectURL(preview.url);
      } catch {}
    });
    const next = list.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setReviewUploads(list);
    setReviewPreviews(next);
  };
  const handleStartEditReview = (review) => {
    setReviewMenus(null);
    setEditingReviewId(review.review_id);
    setReviewForm({
      rating: review.rating,
      headline: review.headline || "",
      program: review.program || "",
      tags: (review.tags || []).join(", "),
      comment: review.comment || "",
    });
    const existingMedia = (review.media_urls || []).map((url, idx) => ({
      name: `Ảnh ${idx + 1}`,
      url,
    }));
    setReviewPreviews(existingMedia);
    setReviewUploads([]);
    if (reviewFormRef.current) {
      reviewFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setReviewForm({ rating: 5, headline: "", program: "", tags: "", comment: "" });
    setReviewUploads([]);
    setReviewPreviews([]);
    setReviewMessage({ error: null, success: null });
  };
  const handleDeleteReview = async (reviewId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const ok = window.confirm("Bạn có chắc muốn xoá đánh giá này?");
    if (!ok) return;
    try {
      await deleteDashboardReviewApi(reviewId);
      if (editingReviewId === reviewId) handleCancelEditReview();
      setReviewMenus(null);
      loadReviews();
    } catch (error) {
      if (error?.response?.status === 401) navigate("/login");
      else
        setReviewMessage({
          error: error?.response?.data?.message || error?.message || "Không thể xoá đánh giá",
          success: null,
        });
    }
  };
  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (reviewSubmitting) return;
    const ratingValue = Number(reviewForm.rating) || 0;
    const comment = reviewForm.comment.trim();
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setReviewMessage({ error: "Vui lòng chọn số sao hợp lệ.", success: null });
      return;
    }
    if (comment.length < 10) {
      setReviewMessage({ error: "Nội dung đánh giá cần ít nhất 10 ký tự.", success: null });
      return;
    }
    setReviewSubmitting(true);
    try {
      const tags = reviewForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const formData = new FormData();
      formData.append("rating", ratingValue);
      formData.append("headline", reviewForm.headline.trim());
      formData.append("comment", comment);
      formData.append("program", reviewForm.program.trim());
      tags.forEach((tag) => formData.append("tags[]", tag));
      reviewUploads.forEach((file) => formData.append("images", file));
      await createDashboardReviewApi(formData);
      setReviewForm({ rating: 5, headline: "", program: "", tags: "", comment: "" });
      handleReviewFilesChange([]);
      setEditingReviewId(null);
      setReviewMessage({ error: null, success: "Cảm ơn bạn! Đánh giá đã được ghi nhận." });
      loadReviews();
    } catch (error) {
      setReviewMessage({
        error: error?.response?.data?.message || error?.message || "Không thể lưu đánh giá. Vui lòng thử lại.",
        success: null,
      });
    } finally {
      setReviewSubmitting(false);
    }
  };
  const handleCommentChange = (reviewId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [reviewId]: value }));
  };
  const handleCommentFilesChange = (reviewId, files) => {
    const fileList = Array.from(files || []).slice(0, 3);
    const oldPreviews = commentPreviews[reviewId] || [];
    oldPreviews.forEach((preview) => {
      try {
        URL.revokeObjectURL(preview.url);
      } catch {}
    });
    const nextPreviews = fileList.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setCommentUploads((prev) => ({ ...prev, [reviewId]: fileList }));
    setCommentPreviews((prev) => ({ ...prev, [reviewId]: nextPreviews }));
  };
  const handleCommentSubmit = async (event, reviewId) => {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    const text = (commentDrafts[reviewId] || "").trim();
    if (!text) return;
    setCommentSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const formData = new FormData();
      formData.append("content", text);
      (commentUploads[reviewId] || []).forEach((file) => formData.append("images", file));
      const res = await createDashboardReviewCommentApi(reviewId, formData);
      const newComment = res?.data || res;
      setReviews((prev) =>
        prev.map((review) =>
          review.review_id === reviewId
            ? {
                ...review,
                comment_count: (review.comment_count || 0) + 1,
                comments: [newComment, ...(review.comments || [])],
              }
            : review
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      handleCommentFilesChange(reviewId, []);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/login");
      } else {
        setReviewMessage({
          error: error?.response?.data?.message || error?.message || "Không thể gửi bình luận.",
          success: null,
        });
      }
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };
  const handleToggleHelpful = async (review) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const reviewId = review.review_id;
    const nextValue = review.userVote ? false : true;
    setHelpfulLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const res = await toggleDashboardReviewHelpfulApi(reviewId, nextValue);
      const payload = res?.data || res;
      setReviews((prev) =>
        prev.map((item) =>
          item.review_id === reviewId
            ? { ...item, helpful_count: payload.helpfulCount, userVote: payload.userVote }
            : item
        )
      );
    } catch (error) {
      if (error?.response?.status === 401) navigate("/login");
    } finally {
      setHelpfulLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };
  const toggleCommentMenu = (commentId) => {
    setCommentMenus((prev) => (prev === commentId ? null : commentId));
  };
  const handleStartEditComment = (reviewId, comment) => {
    setCommentMenus(null);
    setCommentEditing((prev) => ({
      ...prev,
      [comment.comment_id]: {
        reviewId,
        text: comment.content,
        retainMedia: Array.isArray(comment.media_urls) ? [...comment.media_urls] : [],
        newFiles: [],
        previews: [],
      },
    }));
  };
  const handleCancelEditComment = (commentId) => {
    const current = commentEditing[commentId];
    if (current?.previews?.length) {
      current.previews.forEach((preview) => {
        try {
          URL.revokeObjectURL(preview.url);
        } catch {}
      });
    }
    setCommentEditing((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  };
  const handleEditRetainToggle = (commentId, url) => {
    setCommentEditing((prev) => {
      const state = prev[commentId];
      if (!state) return prev;
      const retain = new Set(state.retainMedia || []);
      if (retain.has(url)) retain.delete(url);
      else retain.add(url);
      return {
        ...prev,
        [commentId]: { ...state, retainMedia: Array.from(retain) },
      };
    });
  };
  const handleEditFilesChange = (commentId, files) => {
    setCommentEditing((prev) => {
      const state = prev[commentId];
      if (!state) return prev;
      state.previews.forEach((preview) => {
        try {
          URL.revokeObjectURL(preview.url);
        } catch {}
      });
      const newFiles = Array.from(files || []).slice(0, 3);
      const previews = newFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      return {
        ...prev,
        [commentId]: { ...state, newFiles, previews },
      };
    });
  };
  const handleUpdateCommentSubmit = async (reviewId, commentId) => {
    const state = commentEditing[commentId];
    if (!state) return;
    if (!state.text.trim()) return;
    setCommentSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const formData = new FormData();
      formData.append("content", state.text.trim());
      (state.retainMedia || []).forEach((url) => formData.append("retainMedia[]", url));
      (state.newFiles || []).forEach((file) => formData.append("images", file));
      const res = await updateDashboardReviewCommentApi(reviewId, commentId, formData);
      const updatedComment = res?.data || res;
      setReviews((prev) =>
        prev.map((review) =>
          review.review_id === reviewId
            ? {
                ...review,
                comments: (review.comments || []).map((comment) =>
                  (comment.comment_id || comment.id) === commentId ? updatedComment : comment
                ),
              }
            : review
        )
      );
      handleCancelEditComment(commentId);
    } catch (error) {
      if (error?.response?.status === 401) navigate("/login");
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };
  const handleDeleteComment = async (reviewId, commentId) => {
    if (!confirm("Bạn chắc chắn muốn xoá bình luận này?")) return;
    try {
      await deleteDashboardReviewCommentApi(reviewId, commentId);
      setReviews((prev) =>
        prev.map((review) =>
          review.review_id === reviewId
            ? {
                ...review,
                comment_count: Math.max((review.comment_count || 1) - 1, 0),
                comments: (review.comments || []).filter(
                  (comment) => (comment.comment_id || comment.id) !== commentId
                ),
              }
            : review
        )
      );
      handleCancelEditComment(commentId);
    } catch (error) {
      if (error?.response?.status === 401) navigate("/login");
    }
  };

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
        setPlansError({ message: e?.response?.data?.message || e?.message || "Không tải được kế hoạch" });
      }
      try {
        const sess = await listWorkoutSessionsApi({ status: "completed", limit: 100, offset: 0 });
        const itemsSess = sess?.data?.items ?? sess?.data ?? [];
        const setIds = new Set((Array.isArray(itemsSess) ? itemsSess : []).map((s) => s.plan_id).filter((v) => Number.isFinite(v)));
        setCompletedPlanIds(setIds);
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
        if (ctx?.plan_id) suggested = { plan_id: ctx.plan_id, name: ctx.name || "Kế hoạch" };
      } catch {}
      if (!suggested && Array.isArray(plans) && plans.length > 0) {
        const p = plans[0];
        suggested = { plan_id: p.plan_id, name: p.name || "Kế hoạch" };
      }
      if (mounted) setSuggestedPlan(suggested);
      if (mounted) setContinueLoading(false);
    })();
    return () => { mounted = false; };
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
              try { localStorage.setItem(STREAK_MODAL_KEY, latest.date); } catch {}
            }
            if (shouldShow) setShowStreakModal(true);
          }
        }
      } catch (error) {
        if (!mounted) return;
        setStreakState({
          loading: false,
          data: null,
          error: error?.response?.data?.message || error?.message || "Không tải được dữ liệu streak",
        });
      }
    };
    loadStreak();
    return () => { mounted = false; };
  }, []);

  const handleContinueWorkout = async () => {
    if (continueLoading) return;
    try {
      if (activeSession?.session_id) {
        navigate(`/workout-run/${activeSession.session_id}`);
        return;
      }
      if (suggestedPlan?.plan_id) {
        const res = await createWorkoutSessionApi({ plan_id: suggestedPlan.plan_id, notes: "" });
        const sid = res?.data?.session_id || res?.session_id || res?.data?.id || null;
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
            <div className="p-5 border rounded-xl border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Thành tựu hôm nay
                </h3>
                <span className="text-[11px] text-slate-500">Placeholder</span>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                  —
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  So với hôm qua: —
                </div>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-200">
                  <div className="h-1.5 w-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Tiến độ đạt mục tiêu: —%
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

      {/* COMMUNITY REVIEWS */}
      <section className="px-8 py-16 bg-white md:px-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-slate-500">
                cộng đồng fitnexus
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Đánh giá & cảm nhận từ chính bạn
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Mọi chỉ số bên dưới được tính hoàn toàn từ những đánh giá mà cộng đồng của bạn gửi lên, không có dữ liệu mẫu.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="px-5 py-2 text-sm font-semibold text-blue-600 border rounded-full border-blue-200 hover:bg-blue-50"
                onClick={() => vxpGo("community", navigate)}
              >
                Viết đánh giá
              </button>
              <button
                type="button"
                className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={() => vxpGo("community", navigate)}
              >
                Vào cộng đồng
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
            {/* Summary */}
            <div className="flex flex-col gap-6 p-6 text-white rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Điểm trung bình
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <div className="text-5xl font-black tracking-tight">
                    {reviewStats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-white/70">/ 5 sao</div>
                </div>
                <div className="mt-2">{renderStars(reviewStats.averageRating)}</div>
                <div className="mt-3 text-sm text-white/70">
                  {numberFormatter.format(reviewStats.totalReviews)} lượt đánh giá
                </div>
              </div>

              <div className="space-y-2">
                {ratingBreakdown.map((item) => (
                  <button
                    key={item.star}
                    type="button"
                    onClick={() => toggleRatingFilter(item.star)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10 transition ${
                      ratingFilter === item.star ? "bg-white/25" : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="text-sm font-semibold w-9">{item.star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-amber-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{item.percentage}%</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="text-xs text-white/70 underline underline-offset-4 hover:text-white"
                  onClick={() => setRatingFilter(0)}
                >
                  {ratingFilter ? "Xóa lọc theo sao" : "Đang xem tất cả"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Star className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">Tổng lượt đánh giá</p>
                    <p className="text-lg font-semibold">
                      {numberFormatter.format(reviewStats.totalReviews)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  <MessageCircle className="w-4 h-4 text-white" />
                  Chủ đề nổi bật
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {trendingTags.map((item) => (
                    <span
                      key={item.tag}
                      className="px-2.5 py-1 text-xs rounded-full border border-white/15 bg-white/10 text-white/90"
                    >
                      #{item.tag} · {item.count}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/15 bg-white/10">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60">
                  Viết đánh giá của bạn
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  Chia sẻ trải nghiệm để truyền cảm hứng cho cộng đồng
                </h3>
                <form ref={reviewFormRef} className="mt-4 space-y-3 text-sm" onSubmit={handleReviewSubmit}>
                  {editingReviewId ? (
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-white/80 bg-white/10 rounded-2xl">
                      <span>Đang chỉnh sửa đánh giá hiện có</span>
                      <button
                        type="button"
                        onClick={handleCancelEditReview}
                        className="underline hover:text-white"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/70">
                      Chấm điểm ({reviewForm.rating}★)
                    </label>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starValue = idx + 1;
                        const active = starValue <= Number(reviewForm.rating);
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => handleReviewFieldChange("rating", starValue)}
                            className={`w-9 h-9 rounded-full border ${
                              active
                                ? "bg-amber-300/20 border-amber-200 text-white"
                                : "border-white/20 text-white/60"
                            }`}
                          >
                            {starValue}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-wide text-white/60">Tiêu đề</label>
                      <input
                        type="text"
                        maxLength={80}
                        value={reviewForm.headline}
                        onChange={(e) => handleReviewFieldChange("headline", e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-xs text-slate-900 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Ví dụ: AI Trainer quá hữu ích"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wide text-white/60">Chương trình</label>
                      <input
                        type="text"
                        maxLength={80}
                        value={reviewForm.program}
                        onChange={(e) => handleReviewFieldChange("program", e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-xs text-slate-900 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="AI Trainer · Hybrid Strength"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/60">Tag (phân cách bằng dấu ,)</label>
                    <input
                      type="text"
                      value={reviewForm.tags}
                      onChange={(e) => handleReviewFieldChange("tags", e.target.value)}
                      className="w-full px-3 py-2 mt-1 text-xs text-slate-900 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="AI Trainer, Nutrition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/60">Nội dung đánh giá</label>
                    <textarea
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => handleReviewFieldChange("comment", e.target.value)}
                      className="w-full px-3 py-2 mt-1 text-xs text-slate-900 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Chia sẻ cảm nhận thực tế sau khi luyện tập..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/60">Ảnh minh hoạ</label>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <label className="px-3 py-2 text-xs font-semibold text-blue-700 bg-white rounded-full cursor-pointer hover:bg-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleReviewFilesChange(e.target.files)}
                        />
                        + Thêm ảnh
                      </label>
                      {reviewPreviews.length ? (
                        <div className="flex flex-wrap gap-2">
                          {reviewPreviews.map((preview) => (
                            <div key={preview.url} className="w-16 h-16 overflow-hidden rounded-lg border border-white/20">
                              <img src={preview.url} alt={preview.name} className="object-cover w-full h-full" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {reviewMessage.error ? (
                    <p className="text-xs text-rose-200">{reviewMessage.error}</p>
                  ) : null}
                  {reviewMessage.success ? (
                    <p className="text-xs text-emerald-200">{reviewMessage.success}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-white rounded-full hover:bg-slate-100 disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
                <p className="mt-3 text-[11px] text-white/60">
                  Đánh giá được lưu cục bộ và hiển thị ngay trên bảng tin của bạn.
                </p>
              </div>
            </div>

            {/* Review list */}
            <div className="p-6 bg-white border rounded-3xl border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  Đang lọc:{" "}
                  <span className="font-semibold text-slate-900">
                    {ratingFilter ? `${ratingFilter} sao` : "Tất cả sao"}
                  </span>{" "}
                  · {numberFormatter.format(reviewsTotal)} review
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Sắp xếp:</span>
                  <select
                    className="px-3 py-1.5 text-sm border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Mới nhất</option>
                    <option value="helpful">Hữu ích nhất</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {reviewsLoading ? (
                  <div className="p-6 text-center border rounded-2xl border-slate-200 text-slate-500">
                    Đang tải đánh giá...
                  </div>
                ) : null}
                {!reviewsLoading && reviewsError ? (
                  <div className="p-6 text-center border rounded-2xl border-rose-200 text-rose-600">
                    {reviewsError}
                  </div>
                ) : null}
                {!reviewsLoading && !reviewsError && filteredReviews.length === 0 ? (
                  <div className="p-6 text-center border rounded-2xl border-dashed border-slate-200 text-slate-500">
                    Chưa có đánh giá cho điều kiện lọc hiện tại. Hãy là người đầu tiên chia sẻ cảm nhận!
                  </div>
                ) : null}
                {!reviewsLoading &&
                  !reviewsError &&
                  filteredReviews.map((review) => (
                    <article
                      key={review.review_id}
                      className="p-7 transition border-2 rounded-3xl border-slate-200 hover:border-blue-400 hover:shadow-lg bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {renderAvatar(review.avatar_url, review.display_name, "w-14 h-14 text-lg")}
                          <div>
                            <p className="text-base font-semibold text-slate-900">
                              {review.display_name}
                            </p>
                            <p className="text-xs text-slate-500">{review.program}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div>{reviewDateFormatter.format(new Date(review.created_at))}</div>
                          {user &&
                          (user.user_id === review.user_id || isCurrentUserAdmin) ? (
                            <div className="relative">
                              <button
                                type="button"
                                className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                onClick={() =>
                                  setReviewMenus((prev) => (prev === review.review_id ? null : review.review_id))
                                }
                              >
                                ...
                              </button>
                              {reviewMenus === review.review_id ? (
                                <div className="absolute right-0 z-10 w-32 mt-1 text-xs bg-white border rounded-lg shadow border-slate-200">
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50"
                                    onClick={() => handleStartEditReview(review)}
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleDeleteReview(review.review_id)}
                                  >
                                    Xoá
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                    <div className="flex items-center gap-2 mt-3">
                      {renderStars(review.rating)}
                      <span className="text-sm font-semibold text-slate-700">{review.rating}.0</span>
                    </div>

                    {review.headline ? (
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {review.headline}
                      </h3>
                    ) : null}
                    <p className="mt-1 text-base leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                    {review.media_urls?.length ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {review.media_urls.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-24 h-24 overflow-hidden rounded-xl border border-slate-200"
                          >
                            <img src={url} alt="media" className="object-cover w-full h-full" />
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {review.tags?.length ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {review.tags.map((tag) => (
                          <span
                            key={`${review.review_id}-${tag}`}
                            className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleHelpful(review)}
                          disabled={helpfulLoading[review.review_id]}
                          className={`flex items-center gap-1 text-sm px-3 py-1.5 border rounded-full transition ${
                            review.userVote
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : "text-slate-600 border-slate-200 hover:border-blue-200"
                          } ${helpfulLoading[review.review_id] ? "opacity-60" : ""}`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${review.userVote ? "text-blue-600" : "text-slate-500"}`}
                          />
                          {review.userVote ? "Đã hữu ích" : "Hữu ích"}
                          <span className="ml-1">
                            {numberFormatter.format(review.helpful_count || 0)}
                          </span>
                        </button>
                      </div>
                    </div>
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Bình luận ({numberFormatter.format(review.comment_count || 0)})</span>
                        </div>
                        <div className="mt-3 space-y-4">
                          {(review.comments || []).map((comment) => {
                          const commentId = comment.comment_id || comment.id;
                          const canEdit =
                            user && (user.user_id === comment.user_id || String(user.role || "").toUpperCase() === "ADMIN");
                          const editState = commentEditing[commentId] || null;
                          return (
                            <div key={commentId} className="p-4 text-sm bg-slate-50 rounded-2xl">
                              <div className="flex items-start gap-3">
                                {renderAvatar(comment.avatar_url, comment.display_name, "w-10 h-10 text-xs")}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{comment.display_name}</span>
                                        {comment.role === "ADMIN" ? (
                                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-amber-100 text-amber-700">
                                            Admin
                                          </span>
                                        ) : null}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {reviewDateFormatter.format(new Date(comment.created_at))}
                                      </span>
                                    </div>
                                    {canEdit ? (
                                      <div className="relative">
                                        <button
                                          type="button"
                                          className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                          onClick={() => toggleCommentMenu(commentId)}
                                        >
                                          ...
                                        </button>
                                        {commentMenus === commentId ? (
                                          <div className="absolute right-0 z-10 w-32 mt-1 text-xs bg-white border rounded-lg shadow border-slate-200">
                                            <button
                                              type="button"
                                              className="w-full px-3 py-2 text-left hover:bg-slate-50"
                                              onClick={() => handleStartEditComment(review.review_id, comment)}
                                            >
                                              Sửa
                                            </button>
                                            <button
                                              type="button"
                                              className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                                              onClick={() => {
                                                toggleCommentMenu(null);
                                                handleDeleteComment(review.review_id, commentId);
                                              }}
                                            >
                                              Xoá
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                              {editState ? (
                                <div className="mt-2 space-y-2">
                                  <textarea
                                    rows={3}
                                    value={editState.text}
                                    onChange={(e) =>
                                      setCommentEditing((prev) => ({
                                        ...prev,
                                        [commentId]: { ...editState, text: e.target.value },
                                      }))
                                    }
                                    className="w-full px-3 py-2 text-xs border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                  />
                                  {comment.media_urls?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                      {comment.media_urls.map((url) => (
                                        <label
                                          key={url}
                                          className={`flex items-center gap-1 px-2 py-1 text-[10px] border rounded-full ${
                                            editState.retainMedia?.includes(url)
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : "border-slate-200 text-slate-500"
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={editState.retainMedia?.includes(url)}
                                            onChange={() => handleEditRetainToggle(commentId, url)}
                                          />
                                          {editState.retainMedia?.includes(url) ? "Giữ" : "Bỏ"}
                                          <span className="truncate max-w-[80px]">{url.split("/").pop()}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : null}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label className="px-3 py-1 text-xs font-semibold text-blue-600 border rounded-full border-blue-200 cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleEditFilesChange(commentId, e.target.files)}
                                      />
                                      + Thêm ảnh
                                    </label>
                                    {editState.previews?.length ? (
                                      <div className="flex flex-wrap gap-2">
                                        {editState.previews.map((preview) => (
                                          <div key={preview.url} className="w-12 h-12 overflow-hidden border rounded-lg border-slate-200">
                                            <img src={preview.url} alt={preview.name} className="object-cover w-full h-full" />
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCommentSubmit(review.review_id, commentId)}
                                      className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelEditComment(commentId)}
                                      className="px-3 py-1 text-xs font-semibold text-slate-600 border rounded-full border-slate-300"
                                    >
                                      Huỷ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="mt-2 text-slate-600">{comment.content}</p>
                                  {comment.media_urls?.length ? (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {comment.media_urls.map((url) => (
                                        <a
                                          key={url}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block w-20 h-20 overflow-hidden rounded-lg border border-slate-200"
                                        >
                                          <img src={url} alt="comment" className="object-cover w-full h-full" />
                                        </a>
                                      ))}
                                    </div>
                                  ) : null}
                                </>
                              )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <form onSubmit={(e) => handleCommentSubmit(e, review.review_id)} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="pt-1">
                              {renderAvatar(user?.avatarUrl, currentUserName, "w-10 h-10 text-xs")}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={commentDrafts[review.review_id] || ""}
                                onChange={(e) => handleCommentChange(review.review_id, e.target.value)}
                                placeholder="Viết bình luận..."
                                className="flex-1 px-3 py-2 text-xs border rounded-full border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 text-xs font-semibold text-white rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                disabled={
                                  commentSubmitting[review.review_id] ||
                                  !(commentDrafts[review.review_id] || "").trim()
                                }
                              >
                                {commentSubmitting[review.review_id] ? "Đang gửi..." : "Gửi"}
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="text-[11px] font-semibold text-blue-600 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleCommentFilesChange(review.review_id, e.target.files)}
                              />
                              + Thêm ảnh
                            </label>
                            {commentPreviews[review.review_id]?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {commentPreviews[review.review_id].map((preview) => (
                                  <div
                                    key={preview.url}
                                    className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200"
                                  >
                                    <img src={preview.url} alt={preview.name} className="object-cover w-full h-full" />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </form>
                      </div>
                    </div>
                  </article>
                  ))}
              </div>
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
