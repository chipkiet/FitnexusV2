import { Op, fn, col, literal } from "sequelize";
import DashboardReview from "../models/dashboard.review.model.js";
import DashboardReviewComment from "../models/dashboard.review.comment.model.js";
import DashboardReviewVote from "../models/dashboard.review.vote.model.js";
import User from "../models/user.model.js";
import { uploadBuffer } from "../utils/cloudinary.js";

const REVIEW_IMAGE_FOLDER = "fitnexus/reviews";
const COMMENT_IMAGE_FOLDER = "fitnexus/review-comments";
const MAX_COMMENT_IMAGES = 3;

const sanitizeTags = (raw) => {
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => String(tag || "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  return [];
};

const safeDisplayName = (user) => {
  return (
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Thành viên ẩn danh"
  );
};

const serializeComment = (comment, extra = {}) => {
  if (!comment) return null;
  const plain = comment.get ? comment.get({ plain: true }) : comment;
  const avatarUrl =
    extra.avatarUrl ||
    plain.avatar_url ||
    plain.commentAuthor?.avatarUrl ||
    plain.commentAuthor?.avatar_url ||
    null;
  return {
    comment_id: plain.comment_id,
    review_id: plain.review_id,
    user_id: plain.user_id,
    display_name: plain.display_name,
    role: plain.user_role || "USER",
    content: plain.content,
    media_urls: Array.isArray(plain.media_urls) ? plain.media_urls : [],
    created_at: plain.created_at,
    avatar_url: avatarUrl,
  };
};

const serializeReview = (review, { commentsMap = {}, voteMap = {} } = {}) => {
  const plain = review.get ? review.get({ plain: true }) : review;
  const avatarUrl =
    plain.avatar_url ||
    plain.author?.avatarUrl ||
    plain.author?.avatar_url ||
    null;
  return {
    review_id: plain.review_id,
    user_id: plain.user_id,
    display_name: plain.display_name,
    headline: plain.headline,
    comment: plain.comment,
    rating: plain.rating,
    program: plain.program,
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    media_urls: Array.isArray(plain.media_urls) ? plain.media_urls : [],
    helpful_count: plain.helpful_count || 0,
    comment_count: plain.comment_count || 0,
    status: plain.status,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
    comments: commentsMap[plain.review_id] || [],
    userVote: voteMap[plain.review_id] ?? null,
    avatar_url: avatarUrl,
  };
};

async function fetchComments(reviewIds) {
  if (!reviewIds.length) return {};
  const comments = await DashboardReviewComment.findAll({
    where: { review_id: { [Op.in]: reviewIds } },
    order: [["created_at", "DESC"]],
    include: [{ model: User, as: "commentAuthor", attributes: ["user_id", "avatarUrl"] }],
  });
  return comments.reduce((acc, comment) => {
    const key = comment.review_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(serializeComment(comment));
    return acc;
  }, {});
}

async function fetchVotesMap(reviewIds, userId) {
  if (!userId || !reviewIds.length) return {};
  const votes = await DashboardReviewVote.findAll({
    where: { review_id: { [Op.in]: reviewIds }, user_id: userId, helpful: true },
  });
  return votes.reduce((acc, vote) => {
    acc[vote.review_id] = true;
    return acc;
  }, {});
}

export async function listDashboardReviews(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const rating = parseInt(req.query.rating, 10);
    const sort = req.query.sort === "helpful" ? "helpful" : "recent";

    const where = { status: "published" };
    if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
      where.rating = rating;
    }

    const order =
      sort === "helpful"
        ? [
            ["helpful_count", "DESC"],
            ["created_at", "DESC"],
          ]
        : [["created_at", "DESC"]];

    const { rows, count } = await DashboardReview.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: User, as: "author", attributes: ["user_id", "avatarUrl"] }],
    });

    const reviewIds = rows.map((r) => r.review_id);
    const [commentsMap, voteMap] = await Promise.all([
      fetchComments(reviewIds),
      fetchVotesMap(reviewIds, req.userId),
    ]);

    const items = rows.map((r) => serializeReview(r, { commentsMap, voteMap }));

    const statsRow = await DashboardReview.findOne({
      attributes: [
        [fn("COUNT", col("review_id")), "totalReviews"],
        [fn("AVG", col("rating")), "averageRating"],
        [literal(`SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)`), "rating5"],
        [literal(`SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)`), "rating4"],
        [literal(`SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)`), "rating3"],
        [literal(`SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)`), "rating2"],
        [literal(`SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)`), "rating1"],
      ],
      where: { status: "published" },
      raw: true,
    });

    const stats = {
      totalReviews: Number(statsRow?.totalReviews || 0),
      averageRating: Number(statsRow?.averageRating || 0),
      ratingCounts: {
        5: Number(statsRow?.rating5 || 0),
        4: Number(statsRow?.rating4 || 0),
        3: Number(statsRow?.rating3 || 0),
        2: Number(statsRow?.rating2 || 0),
        1: Number(statsRow?.rating1 || 0),
      },
    };

    return res.json({
      success: true,
      data: {
        items,
        total: count,
        limit,
        offset,
        stats,
      },
    });
  } catch (error) {
    console.error("listDashboardReviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Không tải được đánh giá",
    });
  }
}

export async function createDashboardReview(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để đánh giá" });
    }

    const { rating, headline = "", comment = "", program = "" } = req.body || {};
    const tags = sanitizeTags(req.body?.tags);
    const ratingValue = Number(rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ success: false, message: "Số sao không hợp lệ" });
    }
    const content = String(comment || "").trim();
    if (content.length < 10) {
      return res.status(400).json({ success: false, message: "Nội dung đánh giá phải từ 10 ký tự" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const existing = await DashboardReview.findOne({ where: { user_id: userId } });
    let mediaUrls = Array.isArray(existing?.media_urls) ? existing.media_urls : [];
    if (req.files?.length) {
      const uploads = req.files.slice(0, 3);
      const results = await Promise.all(
        uploads.map(async (file) => {
          if (!file.mimetype?.startsWith("image/")) return null;
          try {
            const uploaded = await uploadBuffer(file.buffer, {
              folder: REVIEW_IMAGE_FOLDER,
              resource_type: "image",
            });
            return uploaded?.secure_url || null;
          } catch (err) {
            console.error("review image upload failed:", err?.message || err);
            return null;
          }
        })
      );
      mediaUrls = results.filter(Boolean);
    }

    const payload = {
      display_name: safeDisplayName(user),
      headline: String(headline || "").trim() || null,
      comment: content,
      rating: ratingValue,
      program: String(program || "").trim() || null,
      tags,
      status: "published",
      media_urls: mediaUrls,
    };

    let savedReview = null;
    if (existing) {
      await existing.update(payload);
      savedReview = existing;
    } else {
      savedReview = await DashboardReview.create({ ...payload, user_id: userId });
    }

    await savedReview.reload({
      include: [{ model: User, as: "author", attributes: ["user_id", "avatarUrl"] }],
    });
    const review = serializeReview(savedReview, { commentsMap: {}, voteMap: {} });
    return res.json({
      success: true,
      message: existing ? "Đánh giá đã được cập nhật" : "Cảm ơn bạn! Đánh giá đã được lưu",
      data: review,
    });
  } catch (error) {
    console.error("createDashboardReview error:", error);
    return res.status(500).json({ success: false, message: "Không thể lưu đánh giá" });
  }
}

export async function createDashboardReviewComment(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để bình luận" });
    }
    const reviewId = parseInt(req.params.reviewId, 10);
    if (!Number.isFinite(reviewId)) {
      return res.status(400).json({ success: false, message: "Review không hợp lệ" });
    }

    const review = await DashboardReview.findByPk(reviewId);
    if (!review || review.status !== "published") {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }

    const content = String(req.body?.content || "").trim();
    if (!content) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung bình luận" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    let mediaUrls = [];
    if (req.files?.length) {
      const uploads = req.files.slice(0, MAX_COMMENT_IMAGES);
      const results = await Promise.all(
        uploads.map(async (file) => {
          if (!file.mimetype?.startsWith("image/")) return null;
          try {
            const uploaded = await uploadBuffer(file.buffer, {
              folder: COMMENT_IMAGE_FOLDER,
              resource_type: "image",
            });
            return uploaded?.secure_url || null;
          } catch (err) {
            console.error("comment image upload failed:", err?.message || err);
            return null;
          }
        })
      );
      mediaUrls = results.filter(Boolean);
    }

    const comment = await DashboardReviewComment.create({
      review_id: reviewId,
      user_id: userId,
      display_name: safeDisplayName(user),
      user_role: String(user.role || "USER").toUpperCase(),
      content,
      media_urls: mediaUrls,
    });

    await DashboardReview.increment({ comment_count: 1 }, { where: { review_id: reviewId } });

    return res.json({
      success: true,
      message: "Đã thêm bình luận",
      data: serializeComment({ ...comment.get({ plain: true }), commentAuthor: user }),
    });
  } catch (error) {
    console.error("createDashboardReviewComment error:", error);
    return res.status(500).json({ success: false, message: "Không thể gửi bình luận" });
  }
}

const normalizeRetainMedia = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.map((url) => String(url || "").trim()).filter(Boolean);
  if (typeof payload === "string") return [payload.trim()].filter(Boolean);
  return [];
};

export async function updateDashboardReviewComment(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để chỉnh sửa" });
    }
    const reviewId = parseInt(req.params.reviewId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    if (!Number.isFinite(reviewId) || !Number.isFinite(commentId)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const [review, comment, user] = await Promise.all([
      DashboardReview.findByPk(reviewId),
      DashboardReviewComment.findByPk(commentId),
      User.findByPk(userId),
    ]);

    if (!review || review.status !== "published") {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }
    if (!comment || comment.review_id !== reviewId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận" });
    }
    const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";
    if (comment.user_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Bạn không thể chỉnh sửa bình luận này" });
    }

    const content = String(req.body?.content || "").trim();
    if (!content) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập nội dung" });
    }

    let mediaUrls = Array.isArray(comment.media_urls) ? comment.media_urls : [];
    const retain = normalizeRetainMedia(req.body?.retainMedia);
    if (retain.length) {
      const retainSet = new Set(retain);
      mediaUrls = mediaUrls.filter((url) => retainSet.has(url));
    } else {
      mediaUrls = [];
    }

    if (req.files?.length) {
      const uploads = req.files.slice(0, MAX_COMMENT_IMAGES);
      const results = await Promise.all(
        uploads.map(async (file) => {
          if (!file.mimetype?.startsWith("image/")) return null;
          try {
            const uploaded = await uploadBuffer(file.buffer, {
              folder: COMMENT_IMAGE_FOLDER,
              resource_type: "image",
            });
            return uploaded?.secure_url || null;
          } catch (err) {
            console.error("comment image upload failed:", err?.message || err);
            return null;
          }
        })
      );
      mediaUrls = [...mediaUrls, ...results.filter(Boolean)].slice(0, MAX_COMMENT_IMAGES);
    }

    await comment.update({ content, media_urls: mediaUrls });

    return res.json({
      success: true,
      message: "Đã cập nhật bình luận",
      data: serializeComment(comment),
    });
  } catch (error) {
    console.error("updateDashboardReviewComment error:", error);
    return res.status(500).json({ success: false, message: "Không thể cập nhật bình luận" });
  }
}

export async function deleteDashboardReviewComment(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để xoá" });
    }
    const reviewId = parseInt(req.params.reviewId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    if (!Number.isFinite(reviewId) || !Number.isFinite(commentId)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const [comment, user] = await Promise.all([
      DashboardReviewComment.findByPk(commentId),
      User.findByPk(userId),
    ]);
    if (!comment || comment.review_id !== reviewId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận" });
    }
    const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";
    if (comment.user_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Bạn không thể xoá bình luận này" });
    }

    await comment.destroy();
    await DashboardReview.decrement({ comment_count: 1 }, { where: { review_id: reviewId } });

    return res.json({ success: true, message: "Đã xoá bình luận", data: { commentId } });
  } catch (error) {
    console.error("deleteDashboardReviewComment error:", error);
    return res.status(500).json({ success: false, message: "Không thể xoá bình luận" });
  }
}

export async function deleteDashboardReview(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập" });
    }
    const reviewId = parseInt(req.params.reviewId, 10);
    if (!Number.isFinite(reviewId)) {
      return res.status(400).json({ success: false, message: "Review không hợp lệ" });
    }

    const review = await DashboardReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }
    const isAdmin = String(req.userRole || "").toUpperCase() === "ADMIN";
    if (review.user_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Bạn không thể xoá đánh giá này" });
    }

    await review.destroy();
    return res.json({ success: true, message: "Đã xoá đánh giá", data: { reviewId } });
  } catch (error) {
    console.error("deleteDashboardReview error:", error);
    return res.status(500).json({ success: false, message: "Không thể xoá đánh giá" });
  }
}

export async function toggleDashboardReviewHelpful(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để đánh dấu hữu ích" });
    }
    const reviewId = parseInt(req.params.reviewId, 10);
    if (!Number.isFinite(reviewId)) {
      return res.status(400).json({ success: false, message: "Review không hợp lệ" });
    }
    const shouldMarkHelpful = req.body?.helpful !== false;

    const review = await DashboardReview.findByPk(reviewId);
    if (!review || review.status !== "published") {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    }

    const existing = await DashboardReviewVote.findOne({
      where: { review_id: reviewId, user_id: userId },
    });

    if (shouldMarkHelpful) {
      if (existing) {
        if (!existing.helpful) await existing.update({ helpful: true });
      } else {
        await DashboardReviewVote.create({ review_id: reviewId, user_id: userId, helpful: true });
      }
    } else if (existing) {
      await existing.destroy();
    }

    const helpfulCount = await DashboardReviewVote.count({
      where: { review_id: reviewId, helpful: true },
    });
    await review.update({ helpful_count: helpfulCount });

    return res.json({
      success: true,
      data: { reviewId, helpfulCount, userVote: shouldMarkHelpful ? true : null },
    });
  } catch (error) {
    console.error("toggleDashboardReviewHelpful error:", error);
    return res.status(500).json({ success: false, message: "Không thể cập nhật hữu ích" });
  }
}
