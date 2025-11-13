// packages/backend/controllers/support.controller.js
import User from "../models/user.model.js";
import { uploadBuffer } from "../utils/cloudinary.js";
import { sendMail } from "../utils/mailer.js";
import { buildBugReportEmail } from "../utils/emailTemplates.js";

const BUG_S3_FOLDER = "fitnexus/bug-reports";

export async function submitBugReport(req, res) {
  try {
    const { title = "", description = "", steps = "", severity = "medium", contactEmail = "" } =
      req.body ?? {};

    if (!description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng mô tả lỗi bạn gặp phải.",
      });
    }

    const userId = req.userId || req.user?.user_id || null;
    const reporter = userId ? await User.findByPk(userId) : null;

    let screenshotUrl = null;
    if (req.file?.buffer?.length) {
      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: BUG_S3_FOLDER,
        resource_type: "image",
      });
      screenshotUrl = uploadResult?.secure_url || null;
    }

    const reportPayload = {
      title: title.trim() || "Báo lỗi không tiêu đề",
      description: description.trim(),
      steps: steps.trim(),
      severity: severity || "medium",
      screenshotUrl,
      reporter: reporter
        ? {
            id: reporter.user_id,
            email: reporter.email,
            username: reporter.username,
            fullName: reporter.fullName,
            plan: reporter.plan,
          }
        : null,
      contactEmail: contactEmail || reporter?.email || null,
    };

    const supportEmail =
      process.env.SUPPORT_EMAIL ||
      process.env.ADMIN_ALERT_EMAIL ||
      process.env.SMTP_USER;

    if (supportEmail) {
      const { subject, html, text } = buildBugReportEmail(reportPayload);

      await sendMail({
        to: supportEmail,
        subject,
        html,
        text,
      });
    }

    return res.json({
      success: true,
      message: "Cảm ơn bạn! Báo lỗi đã được gửi tới đội ngũ hỗ trợ.",
      data: {
        screenshotUrl,
      },
    });
  } catch (err) {
    console.error("submitBugReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Không thể gửi báo lỗi. Vui lòng thử lại sau.",
    });
  }
}
