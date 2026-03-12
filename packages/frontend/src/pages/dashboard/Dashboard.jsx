import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import ChatWidget from "../../components/common/ChatWidget.jsx";
import { Flame, MessageCircle, Star, ThumbsUp, Activity, Trophy } from "lucide-react";

const CircularProgress = ({ value, max, colorClass, size = 90, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const strokeDashoffset = circumference - (clampedValue / safeMax) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-slate-100 fill-none" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className={`fill-none ${colorClass}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

import DashboardHero from "../../pages/dashboard/DashboardHero.jsx"

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
import { normalize } from "three/src/math/MathUtils.js";

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
const REVIEW_PREVIEW_LIMIT = 3;
const REVIEW_CONTENT_LIMIT = 200;
const COMMENT_PREVIEW_LIMIT = 2;
const COMMENT_CONTENT_LIMIT = 150;

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
const needsTruncate = (text = "", limit = 0) => (text || "").length > limit;
const formatTruncatedText = (text = "", limit = 0) => {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit)}…`;
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
  const [expandedReviewContent, setExpandedReviewContent] = useState({});
  const [commentExpanded, setCommentExpanded] = useState({});
  const [expandedCommentContent, setExpandedCommentContent] = useState({});
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
  const scrollToReviewForm = () => {
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
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
  const displayedReviews = useMemo(
    () => filteredReviews.slice(0, REVIEW_PREVIEW_LIMIT),
    [filteredReviews]
  );
  const hiddenReviewCount = Math.max(filteredReviews.length - REVIEW_PREVIEW_LIMIT, 0);
  useEffect(() => {
    return () => {
      Object.values(commentPreviews).forEach((list) => {
        (list || []).forEach((preview) => {
          try {
            URL.revokeObjectURL(preview.url);
          } catch { }
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
          } catch { }
        });
      });
    };
  }, [commentEditing]);
  useEffect(() => {
    return () => {
      reviewPreviews.forEach((preview) => {
        try {
          if (isBlobUrl(preview.url)) URL.revokeObjectURL(preview.url);
        } catch { }
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
  const toggleCommentVisibility = (reviewId) => {
    setCommentExpanded((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
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
      } catch { }
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
      } catch { }
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
              comments: [...(review.comments || []), newComment],
            }
            : review
        )
      );
      setCommentExpanded((prev) => ({ ...prev, [reviewId]: true }));
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
        } catch { }
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
        } catch { }
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
      } catch { }
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
      } catch { }

      let suggested = null;
      try {
        const raw = sessionStorage.getItem("current_plan_context");
        const ctx = raw ? JSON.parse(raw) : null;
        if (ctx?.plan_id)
          suggested = { plan_id: ctx.plan_id, name: ctx.name || "Kế hoạch" };
      } catch { }
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
      } catch { }
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
              } catch { }
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
      <DashboardHero
        user={user}
        onContinue={handleContinueWorkout}
        continueLoading={continueLoading}
        activeSession={activeSession}
        suggestedPlan={suggestedPlan}
        onPremiumClick={() => vxpGo("pricing", navigate)}
        isPremiumOrAdmin={isPremiumOrAdmin}
      />

      {/* HORIZONTAL STATS BAR (Immediately below Hero) */}
      <section className="px-6 py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* 1. Today's Achievement */}
            <div className="flex items-center p-6 space-x-5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-transform hover:-translate-y-1">
              <CircularProgress
                value={weeklySummary?.totalWeek || 0}
                max={5}
                colorClass="stroke-blue-500"
              >
                <Activity className="w-8 h-8 text-blue-500 mb-1" />
              </CircularProgress>
              <div className="flex-1">
                <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">Thành tựu hôm nay</p>
                <div className="flex items-baseline mt-1 space-x-2">
                  <span className="text-4xl font-black text-slate-900">{weeklySummary?.todayCount || 0}</span>
                  <span className="text-sm font-medium text-slate-500">buổi</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {weeklySummary ? (
                    weeklySummary.diff === 0 ? "Tương đương hôm qua" :
                      weeklySummary.diff > 0 ? `Cao hơn hôm qua ${weeklySummary.diff} buổi` :
                        `Thấp hơn hôm qua ${Math.abs(weeklySummary.diff)} buổi`
                  ) : "So với hôm qua: —"}
                </p>
              </div>
            </div>

            {/* 2. Completed Plans */}
            <div className="flex items-center p-6 space-x-5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-transform hover:-translate-y-1">
              <CircularProgress
                value={completedPlanIds.size}
                max={plans?.length > 0 ? plans.length : 1}
                colorClass="stroke-emerald-500"
              >
                <Trophy className="w-8 h-8 text-emerald-500 mb-1" />
              </CircularProgress>
              <div className="flex-1">
                <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">Kế hoạch hoàn thành</p>
                <div className="flex items-baseline mt-1 space-x-2">
                  <span className="text-4xl font-black text-slate-900">{completedPlanIds.size}</span>
                  <span className="text-sm font-medium text-slate-500">kế hoạch</span>
                </div>
                <p className="mt-1 text-xs text-emerald-600 font-medium cursor-pointer hover:underline" onClick={() => navigate("/plans/select")}>
                  Xem chi tiết &rarr;
                </p>
              </div>
            </div>

            {/* 3. Streak */}
            <div className="flex items-center p-6 space-x-5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-transform hover:-translate-y-1">
              <CircularProgress
                value={streakState.data?.currentStreak || 0}
                max={streakState.data?.bestStreak > 0 ? streakState.data.bestStreak : 1}
                colorClass="stroke-amber-500"
              >
                <Flame className="w-8 h-8 text-amber-500 mb-1" />
              </CircularProgress>
              <div className="flex-1">
                <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">Chuỗi ngày 🔥</p>
                <div className="flex items-baseline mt-1 space-x-2">
                  <span className="text-4xl font-black text-slate-900">{streakState.data?.currentStreak || 0}</span>
                  <span className="text-sm font-medium text-slate-500">ngày</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                  Kỷ lục: <span className="font-bold text-slate-700">{streakState.data?.bestStreak || 0} ngày</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Navigation */}
      <section className="px-6 py-12 bg-white md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              Khám phá các tính năng nổi bật của Fitnexus
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* AI Trainer */}
            <button
              type="button"
              onClick={() => vxpGo("ai", navigate)}
              className="relative overflow-hidden text-left transition-all duration-300 group rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-blue-300/60 flex flex-col h-full"
            >
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-slate-950 rounded-t-[2rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundImage: `url(${ImgAI})` }}></div>
                <img
                  src={ImgAI}
                  alt="AI Trainer"
                  className="relative z-10 object-contain w-full h-full transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute z-30 text-white bottom-6 left-6 right-6">
                  <div className="text-2xl font-black tracking-tight drop-shadow-md">AI Trainer</div>
                  <div className="text-sm font-semibold text-blue-300 drop-shadow-sm mt-1">Trợ lý ảo cá nhân hóa</div>
                </div>
              </div>
              <div className="flex flex-col p-6 flex-1 bg-gradient-to-br from-white/80 to-white/40">
                <p className="text-sm leading-relaxed text-slate-600">
                  Công nghệ AI tiên tiến phân tích từng chuyển động của bạn, cung cấp hướng dẫn kỹ thuật theo thời gian thực để ngăn ngừa chấn thương.
                </p>
                <div className="mt-auto pt-4 text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Khám phá ngay <span>&rarr;</span>
                </div>
              </div>
            </button>

            {/* Luyện tập */}
            <button
              type="button"
              onClick={() => vxpGo("workout", navigate)}
              className="relative overflow-hidden text-left transition-all duration-300 group rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-emerald-300/60 flex flex-col h-full"
            >
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-slate-950 rounded-t-[2rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundImage: `url(${ImgExercise})` }}></div>
                <img
                  src={ImgExercise}
                  alt="Luyện tập"
                  className="relative z-10 object-contain w-full h-full transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute z-30 text-white bottom-6 left-6 right-6">
                  <div className="text-2xl font-black tracking-tight drop-shadow-md">Luyện Tập</div>
                  <div className="text-sm font-semibold text-emerald-300 drop-shadow-sm mt-1">Chương trình chuyên sâu</div>
                </div>
              </div>
              <div className="flex flex-col p-6 flex-1 bg-gradient-to-br from-white/80 to-white/40">
                <p className="text-sm leading-relaxed text-slate-600">
                  Hệ thống bài tập phong phú được thiết kế khoa học phù hợp với từng cấp độ, nhóm cơ và mục tiêu phát triển thể hình của bạn.
                </p>
                <div className="mt-auto pt-4 text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Bắt đầu tập luyện <span>&rarr;</span>
                </div>
              </div>
            </button>

            {/* Mô hình hoá */}
            <button
              type="button"
              onClick={() => vxpGo("modeling", navigate)}
              className="relative overflow-hidden text-left transition-all duration-300 group rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-purple-300/60 flex flex-col h-full"
            >
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-slate-950 rounded-t-[2rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundImage: `url(${ImgModel})` }}></div>
                <img
                  src={ImgModel}
                  alt="Mô hình hoá"
                  className="relative z-10 object-contain w-full h-full transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute z-30 text-white bottom-6 left-6 right-6">
                  <div className="text-2xl font-black tracking-tight drop-shadow-md">Mô Hình Hoá 3D</div>
                  <div className="text-sm font-semibold text-purple-300 drop-shadow-sm mt-1">Phân tích đa chiều</div>
                </div>
              </div>
              <div className="flex flex-col p-6 flex-1 bg-gradient-to-br from-white/80 to-white/40">
                <p className="text-sm leading-relaxed text-slate-600">
                  Trải nghiệm góc nhìn 3D trực quan sinh động. Tối ưu hoá phạm vi chuyển động và góc nghiêng để kích thích cơ bắp tối đa.
                </p>
                <div className="mt-auto pt-4 text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Trải nghiệm 3D <span>&rarr;</span>
                </div>
              </div>
            </button>

            {/* Dinh dưỡng */}
            <button
              type="button"
              onClick={() => vxpGo("nutrition", navigate)}
              className="relative overflow-hidden text-left transition-all duration-300 group rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-orange-300/60 flex flex-col h-full"
            >
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-slate-950 rounded-t-[2rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125 group-hover:opacity-70 transition-opacity duration-700" style={{ backgroundImage: `url(${ImgNutrition})` }}></div>
                <img
                  src={ImgNutrition}
                  alt="Dinh dưỡng"
                  className="relative z-10 object-contain w-full h-full transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute z-30 text-white bottom-6 left-6 right-6">
                  <div className="text-2xl font-black tracking-tight drop-shadow-md">Dinh Dưỡng</div>
                  <div className="text-sm font-semibold text-orange-300 drop-shadow-sm mt-1">Gợi ý thông minh</div>
                </div>
              </div>
              <div className="flex flex-col p-6 flex-1 bg-gradient-to-br from-white/80 to-white/40">
                <p className="text-sm leading-relaxed text-slate-600">
                  Xây dựng thực đơn cân bằng hoàn hảo. Theo dõi calo, macronutrients và vi chất để đảm bảo năng lượng tối ưu cho mọi mục tiêu.
                </p>
                <div className="mt-auto pt-4 text-sm font-semibold text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Theo dõi khẩu phần <span>&rarr;</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* COMMUNITY REVIEWS */}
      <section className="px-6 py-20 bg-slate-50 md:px-12">
        <div className="mx-auto space-y-12 max-w-7xl">
          <div className="text-center md:text-left md:flex justify-between items-end">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1.5 mb-4 text-xs font-bold tracking-wider text-blue-700 uppercase bg-blue-100 rounded-full">
                Cộng đồng Fitnexus
              </span>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                Đánh giá & Cảm nhận
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Hàng ngàn người dùng đã trải nghiệm và thay đổi bản thân cùng Fitnexus. Đọc những chia sẻ thực tế và tham gia cùng chúng tôi.
              </p>
            </div>
          </div>

          {/* Anchor: Tổng quan Đánh Giá */}
          <div className="flex flex-col gap-8 p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] md:flex-row md:items-center">
            <div className="flex flex-col items-center flex-1 md:items-start md:border-r border-slate-100 md:pr-10">
              <div className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                Điểm trung bình
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <div className="text-6xl font-black tracking-tighter text-slate-900 md:text-7xl">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="text-2xl font-bold text-slate-300">/5</div>
              </div>
              <div className="mt-4">
                {renderStars(reviewStats.averageRating)}
              </div>
              <div className="mt-3 text-sm font-medium text-slate-500">
                Dựa trên <span className="font-bold text-slate-900">{numberFormatter.format(reviewStats.totalReviews)}</span> lượt đánh giá
              </div>
            </div>

            <div className="flex-1 w-full max-w-md mx-auto space-y-3 md:pl-10">
              {ratingBreakdown.map((item) => (
                <button
                  key={item.star}
                  type="button"
                  onClick={() => toggleRatingFilter(item.star)}
                  className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all w-full ${ratingFilter === item.star
                    ? "bg-blue-50 ring-1 ring-blue-200"
                    : "bg-transparent hover:bg-slate-50"
                    }`}
                >
                  <span className="text-sm font-bold w-10 text-left text-slate-700">
                    {item.star} <span className="text-amber-400">★</span>
                  </span>
                  <div className="flex-1 h-2.5 overflow-hidden bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right text-slate-600">{item.percentage}%</span>
                </button>
              ))}
              {ratingFilter !== 0 && (
                <button
                  type="button"
                  className="w-full px-4 py-2 mt-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={() => setRatingFilter(0)}
                >
                  Xóa bộ lọc sao
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr,400px]">
            {/* Review Form Column (Right on Desktop, order 2) */}
            <div className="flex flex-col order-1 lg:order-2 space-y-8">
              <div className="sticky p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] top-32">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Chia sẻ trải nghiệm
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Đánh giá của bạn giúp cộng đồng Fitnexus ngày càng phát triển.
                  </p>
                </div>

                <form
                  ref={reviewFormRef}
                  className="space-y-5"
                  onSubmit={handleReviewSubmit}
                >
                  {editingReviewId ? (
                    <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50 rounded-xl">
                      <span>Đang chỉnh sửa đánh giá</span>
                      <button
                        type="button"
                        onClick={handleCancelEditReview}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : null}

                  {/* Rating selection */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                      Chấm điểm
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starValue = idx + 1;
                        const active = starValue <= Number(reviewForm.rating);
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => handleReviewFieldChange("rating", starValue)}
                            className={`w-12 h-12 rounded-xl text-lg font-black transition-all duration-200 flex items-center justify-center ${active
                              ? "bg-amber-400 text-white shadow-lg shadow-amber-200 scale-110"
                              : "bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400"
                              }`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floating labels inputs */}
                  <div className="relative">
                    <input
                      type="text"
                      id="review_headline"
                      maxLength={80}
                      value={reviewForm.headline}
                      onChange={(e) => handleReviewFieldChange("headline", e.target.value)}
                      className="block px-5 pb-3 pt-7 w-full text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 peer transition-all"
                      placeholder=" "
                    />
                    <label htmlFor="review_headline" className="absolute text-[13px] text-slate-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 font-semibold peer-focus:text-blue-600">
                      Tiêu đề đánh giá
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="review_program"
                      maxLength={80}
                      value={reviewForm.program}
                      onChange={(e) => handleReviewFieldChange("program", e.target.value)}
                      className="block px-5 pb-3 pt-7 w-full text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 peer transition-all"
                      placeholder=" "
                    />
                    <label htmlFor="review_program" className="absolute text-[13px] text-slate-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 font-semibold peer-focus:text-blue-600">
                      Chương trình / Gói tập
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="review_tags"
                      value={reviewForm.tags}
                      onChange={(e) => handleReviewFieldChange("tags", e.target.value)}
                      className="block px-5 pb-3 pt-7 w-full text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 peer transition-all"
                      placeholder=" "
                    />
                    <label htmlFor="review_tags" className="absolute text-[13px] text-slate-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 font-semibold peer-focus:text-blue-600">
                      Tag (Ví dụ: Giảm cân, Tăng cơ, ...)
                    </label>
                  </div>

                  <div className="relative">
                    <textarea
                      id="review_comment"
                      rows={5}
                      value={reviewForm.comment}
                      onChange={(e) => handleReviewFieldChange("comment", e.target.value)}
                      className="block px-5 pb-3 pt-7 w-full text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 peer transition-all resize-none"
                      placeholder=" "
                    />
                    <label htmlFor="review_comment" className="absolute text-[13px] text-slate-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 font-semibold peer-focus:text-blue-600">
                      Nội dung chi tiết
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                      Ảnh minh hoạ cụ thể
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-5 py-3 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleReviewFilesChange(e.target.files)}
                        />
                        <span className="mr-1">+</span> Thêm ảnh
                      </label>
                      {reviewPreviews.length ? (
                        <div className="flex flex-wrap gap-2">
                          {reviewPreviews.map((preview) => (
                            <div
                              key={preview.url}
                              className="w-12 h-12 overflow-hidden border border-slate-200 rounded-xl shadow-sm"
                            >
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {reviewMessage.error && (
                    <div className="p-4 text-sm font-medium text-rose-800 bg-rose-50 border border-rose-100 rounded-xl">
                      {reviewMessage.error}
                    </div>
                  )}
                  {reviewMessage.success && (
                    <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
                      {reviewMessage.success}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full px-8 py-4 text-sm font-black text-white uppercase tracking-widest transition-all duration-300 bg-blue-600 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:bg-slate-900 hover:shadow-[0_8px_25px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting ? "Đang xử lý..." : "Gửi Đánh Giá"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Review list column (Left on Desktop, order 1) */}
            <div className="flex flex-col order-2 lg:order-1">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
                <div className="text-sm font-medium text-slate-500">
                  <span className="font-bold text-slate-900">{numberFormatter.format(reviewsTotal)} Đánh giá</span>
                  {ratingFilter > 0 && (
                    <>
                      <span className="mx-2 text-gray-300">|</span>
                      <span>Lọc theo: <span className="font-bold text-slate-900">{ratingFilter} sao</span></span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <span>Sắp xếp theo</span>
                  <select
                    className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-colors cursor-pointer"
                    style={{ borderRadius: "var(--card-radius)" }}
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
                {!reviewsLoading &&
                  !reviewsError &&
                  filteredReviews.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-2xl border-slate-200 text-slate-500">
                    Chưa có đánh giá cho điều kiện lọc hiện tại. Hãy là người
                    đầu tiên chia sẻ cảm nhận!
                  </div>
                ) : null}
                {!reviewsLoading &&
                  !reviewsError &&
                  displayedReviews.map((review) => {
                    const reviewId = review.review_id;
                    const reviewBody = review.comment || "";
                    const reviewExpanded = !!expandedReviewContent[reviewId];
                    const reviewShouldTruncate = needsTruncate(
                      reviewBody,
                      REVIEW_CONTENT_LIMIT
                    );
                    const reviewDisplayText =
                      reviewExpanded || !reviewShouldTruncate
                        ? reviewBody
                        : formatTruncatedText(reviewBody, REVIEW_CONTENT_LIMIT);

                    const commentSection = (() => {
                      const allComments = review.comments || [];
                      const sortedComments = [...allComments].sort((a, b) => {
                        const aDate = new Date(
                          a.created_at || a.createdAt || 0
                        ).getTime();
                        const bDate = new Date(
                          b.created_at || b.createdAt || 0
                        ).getTime();
                        return aDate - bDate;
                      });
                      const expanded = !!commentExpanded[reviewId];
                      const visibleComments = expanded
                        ? sortedComments
                        : sortedComments.slice(0, COMMENT_PREVIEW_LIMIT);
                      const hiddenComments = Math.max(
                        sortedComments.length - COMMENT_PREVIEW_LIMIT,
                        0
                      );

                      return (
                        <div className="pt-5 mt-6 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>
                              Bình luận (
                              {numberFormatter.format(
                                review.comment_count || 0
                              )}
                              )
                            </span>
                          </div>
                          <div className="mt-3 space-y-4">
                            {visibleComments.map((comment) => {
                              const commentId =
                                comment.comment_id || comment.id;
                              const canEdit =
                                user &&
                                (user.user_id === comment.user_id ||
                                  String(user.role || "").toUpperCase() ===
                                  "ADMIN");
                              const editState =
                                commentEditing[commentId] || null;
                              const commentBody = comment.content || "";
                              const commentExpandedState =
                                !!expandedCommentContent[commentId];
                              const commentShouldTruncate = needsTruncate(
                                commentBody,
                                COMMENT_CONTENT_LIMIT
                              );
                              const commentDisplayText =
                                commentExpandedState || !commentShouldTruncate
                                  ? commentBody
                                  : formatTruncatedText(
                                    commentBody,
                                    COMMENT_CONTENT_LIMIT
                                  );

                              return (
                                <div
                                  key={commentId}
                                  className="p-4 text-sm bg-gray-50 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                  style={{ borderRadius: "var(--card-radius)" }}
                                >
                                  <div className="flex items-start gap-3">
                                    {renderAvatar(
                                      comment.avatar_url,
                                      comment.display_name,
                                      "w-10 h-10 shadow-sm ring-1 ring-gray-200 text-xs"
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">
                                              {comment.display_name}
                                            </span>
                                            {comment.role === "ADMIN" ? (
                                              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                                                Admin
                                              </span>
                                            ) : null}
                                          </div>
                                          <span className="text-[10px] font-medium text-gray-400">
                                            {reviewDateFormatter.format(
                                              new Date(comment.created_at)
                                            )}
                                          </span>
                                        </div>
                                        {canEdit ? (
                                          <div className="relative">
                                            <button
                                              type="button"
                                              className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                              onClick={() =>
                                                toggleCommentMenu(commentId)
                                              }
                                            >
                                              ...
                                            </button>
                                            {commentMenus === commentId ? (
                                              <div className="absolute right-0 z-10 w-32 mt-1 text-xs bg-white border border-gray-100 shadow-lg rounded-xl">
                                                <button
                                                  type="button"
                                                  className="w-full px-4 py-2 text-left font-medium hover:bg-gray-50 transition-colors first:rounded-t-xl"
                                                  onClick={() =>
                                                    handleStartEditComment(
                                                      reviewId,
                                                      comment
                                                    )
                                                  }
                                                >
                                                  Cập nhật
                                                </button>
                                                <button
                                                  type="button"
                                                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                                                  onClick={() => {
                                                    toggleCommentMenu(null);
                                                    handleDeleteComment(
                                                      reviewId,
                                                      commentId
                                                    );
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
                                                [commentId]: {
                                                  ...editState,
                                                  text: e.target.value,
                                                },
                                              }))
                                            }
                                            className="w-full px-4 py-3 text-xs bg-white border border-gray-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                          />
                                          {comment.media_urls?.length ? (
                                            <div className="flex flex-wrap gap-2">
                                              {comment.media_urls.map((url) => (
                                                <label
                                                  key={url}
                                                  className={`flex items-center gap-1 px-2 py-1 text-[10px] border rounded-full ${editState.retainMedia?.includes(
                                                    url
                                                  )
                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                    : "border-slate-200 text-slate-500"
                                                    }`}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={editState.retainMedia?.includes(
                                                      url
                                                    )}
                                                    onChange={() =>
                                                      handleEditRetainToggle(
                                                        commentId,
                                                        url
                                                      )
                                                    }
                                                  />
                                                  {editState.retainMedia?.includes(
                                                    url
                                                  )
                                                    ? "Giữ"
                                                    : "Bỏ"}
                                                  <span className="truncate max-w-[80px]">
                                                    {url.split("/").pop()}
                                                  </span>
                                                </label>
                                              ))}
                                            </div>
                                          ) : null}
                                          <div className="flex flex-wrap items-center gap-2">
                                            <label className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-full cursor-pointer">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) =>
                                                  handleEditFilesChange(
                                                    commentId,
                                                    e.target.files
                                                  )
                                                }
                                              />
                                              + Thêm ảnh
                                            </label>
                                            {editState.previews?.length ? (
                                              <div className="flex flex-wrap gap-2">
                                                {editState.previews.map(
                                                  (preview) => (
                                                    <div
                                                      key={preview.url}
                                                      className="w-12 h-12 overflow-hidden border rounded-lg border-slate-200"
                                                    >
                                                      <img
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        className="object-cover w-full h-full"
                                                      />
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            ) : null}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUpdateCommentSubmit(
                                                  reviewId,
                                                  commentId
                                                )
                                              }
                                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
                                            >
                                              Lưu
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleCancelEditComment(
                                                  commentId
                                                )
                                              }
                                              className="px-3 py-1 text-xs font-semibold border rounded-full text-slate-600 border-slate-300"
                                            >
                                              Huỷ
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <p className="mt-2 text-slate-600">
                                            {commentDisplayText}
                                            {commentShouldTruncate ? (
                                              <button
                                                type="button"
                                                className="ml-1 text-[11px] font-semibold text-blue-600 hover:underline"
                                                onClick={() =>
                                                  setExpandedCommentContent(
                                                    (prev) => ({
                                                      ...prev,
                                                      [commentId]:
                                                        !commentExpandedState,
                                                    })
                                                  )
                                                }
                                              >
                                                {commentExpandedState
                                                  ? "Thu gọn"
                                                  : "Xem thêm"}
                                              </button>
                                            ) : null}
                                          </p>
                                          {comment.media_urls?.length ? (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {comment.media_urls.map((url) => (
                                                <a
                                                  key={url}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block w-20 h-20 overflow-hidden border rounded-lg border-slate-200"
                                                >
                                                  <img
                                                    src={url}
                                                    alt="comment"
                                                    className="object-cover w-full h-full"
                                                  />
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
                            {hiddenComments > 0 ? (
                              <div className="pt-2 text-center">
                                <button
                                  type="button"
                                  className="text-xs font-semibold text-blue-600 hover:underline"
                                  onClick={() =>
                                    toggleCommentVisibility(reviewId)
                                  }
                                >
                                  {expanded
                                    ? "Thu gọn bình luận"
                                    : `Xem thêm bình luận${hiddenComments
                                      ? ` (${hiddenComments}+)`
                                      : ""
                                    }`}
                                </button>
                              </div>
                            ) : null}
                            <form
                              onSubmit={(e) => handleCommentSubmit(e, reviewId)}
                              className="space-y-2"
                            >
                              <div className="flex items-start gap-2">
                                <div className="pt-1">
                                  {renderAvatar(
                                    user?.avatarUrl,
                                    currentUserName,
                                    "w-10 h-10 text-xs"
                                  )}
                                </div>
                                <div className="flex items-center flex-1 gap-2">
                                  <input
                                    type="text"
                                    value={commentDrafts[reviewId] || ""}
                                    onChange={(e) =>
                                      handleCommentChange(
                                        reviewId,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Viết bình luận..."
                                    className="flex-1 px-3 py-2 text-xs border rounded-full border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                                    disabled={
                                      commentSubmitting[reviewId] ||
                                      !(commentDrafts[reviewId] || "").trim()
                                    }
                                  >
                                    {commentSubmitting[reviewId]
                                      ? "Đang gửi..."
                                      : "Gửi"}
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
                                    onChange={(e) =>
                                      handleCommentFilesChange(
                                        reviewId,
                                        e.target.files
                                      )
                                    }
                                  />
                                  + Thêm ảnh
                                </label>
                                {commentPreviews[reviewId]?.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {commentPreviews[reviewId].map(
                                      (preview) => (
                                        <div
                                          key={preview.url}
                                          className="overflow-hidden border rounded-lg w-14 h-14 border-slate-200"
                                        >
                                          <img
                                            src={preview.url}
                                            alt={preview.name}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </form>
                          </div>
                        </div>
                      );
                    })();

                    return (
                      <article
                        key={reviewId}
                        className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                        style={{ borderRadius: "var(--card-radius)" }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {renderAvatar(
                              review.avatar_url,
                              review.display_name,
                              "w-12 h-12 md:w-14 md:h-14 shadow-sm ring-2 ring-white"
                            )}
                            <div>
                              <p className="text-base font-semibold text-slate-900">
                                {review.display_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {review.program}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div>
                              {reviewDateFormatter.format(
                                new Date(review.created_at)
                              )}
                            </div>
                            {user &&
                              (user.user_id === review.user_id ||
                                isCurrentUserAdmin) ? (
                              <div className="relative">
                                <button
                                  type="button"
                                  className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                  onClick={() =>
                                    setReviewMenus((prev) =>
                                      prev === review.review_id
                                        ? null
                                        : review.review_id
                                    )
                                  }
                                >
                                  ...
                                </button>
                                {reviewMenus === review.review_id ? (
                                  <div className="absolute right-0 z-10 w-32 mt-1 text-xs bg-white border rounded-lg shadow border-slate-200">
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 text-left hover:bg-slate-50"
                                      onClick={() =>
                                        handleStartEditReview(review)
                                      }
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                                      onClick={() =>
                                        handleDeleteReview(review.review_id)
                                      }
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
                          <span className="text-sm font-semibold text-slate-700">
                            {review.rating}.0
                          </span>
                        </div>

                        {review.headline ? (
                          <h3 className="mt-2 text-base font-semibold text-slate-900">
                            {review.headline}
                          </h3>
                        ) : null}
                        <p className="mt-1 text-base leading-relaxed text-slate-600">
                          {reviewDisplayText}
                          {reviewShouldTruncate ? (
                            <button
                              type="button"
                              className="ml-2 text-sm font-semibold text-blue-600 hover:underline"
                              onClick={() =>
                                setExpandedReviewContent((prev) => ({
                                  ...prev,
                                  [reviewId]: !reviewExpanded,
                                }))
                              }
                            >
                              {reviewExpanded ? "Thu gọn" : "Xem chi tiết"}
                            </button>
                          ) : null}
                        </p>
                        {review.media_urls?.length ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {review.media_urls.map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-24 h-24 overflow-hidden border rounded-xl border-slate-200"
                              >
                                <img
                                  src={url}
                                  alt="media"
                                  className="object-cover w-full h-full"
                                />
                              </a>
                            ))}
                          </div>
                        ) : null}

                        {review.tags?.length ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {review.tags.map((tag) => (
                              <span
                                key={`${review.review_id}-${tag}`}
                                className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full text-slate-600 bg-gray-100 border border-gray-200 shadow-sm"
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
                              className={`flex items-center gap-1 text-sm px-3 py-1.5 border rounded-full transition ${review.userVote
                                ? "text-blue-600 border-blue-200 bg-blue-50"
                                : "text-slate-600 border-slate-200 hover:border-blue-200"
                                } ${helpfulLoading[review.review_id]
                                  ? "opacity-60"
                                  : ""
                                }`}
                            >
                              <ThumbsUp
                                className={`w-4 h-4 ${review.userVote
                                  ? "text-blue-600"
                                  : "text-slate-500"
                                  }`}
                              />
                              {review.userVote ? "Đã hữu ích" : "Hữu ích"}
                              <span className="ml-1">
                                {numberFormatter.format(
                                  review.helpful_count || 0
                                )}
                              </span>
                            </button>
                          </div>
                        </div>

                        {commentSection}
                      </article>
                    );
                  })}
                {!reviewsLoading && !reviewsError && hiddenReviewCount > 0 ? (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      className="px-5 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50"
                      onClick={() => vxpGo("community", navigate)}
                    >
                      Xem thêm bài viết
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* CTA SECTION */}
      {/* < section className="relative py-20 px-6 md:px-20 bg-gradient-to-br from-blue-200 via-blue-400 to-indigo-400 text-white overflow-hidden rounded-t-[3rem] mt-16 mb-24" >
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
      </section > */}

      {/* FOOTER */}
      < footer className="bg-[#0b1023] text-gray-300 py-16 px-8 md:px-20 border-t border-gray-800" >
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
      </footer >

      {/* Floating Chat Widget */}
      < ChatWidget />

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
      ) : null
      }
    </div >
  );
}


