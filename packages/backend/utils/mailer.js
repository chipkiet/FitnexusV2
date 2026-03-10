import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"FITNEXUS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
// mẫu email
export function lockEmailTemplate({ fullName, reason }) {
  return {
    subject: "Tài khoản FITNEXUS của bạn đã bị khóa",
    html: `
      <p>Chào ${fullName || "bạn"},</p>
      <p>Tài khoản của bạn đã <b>bị khóa</b>.</p>
      ${reason ? `<p>Lý do: <i>${reason}</i></p>` : ""}
      <p>Nếu bạn cần hỗ trợ, vui lòng phản hồi email này.</p>
      <p>— FITNEXUS Team</p>
    `,
  };
}

export function unlockEmailTemplate({ fullName }) {
  return {
    subject: "Tài khoản FITNEXUS của bạn đã được mở khóa",
    html: `
      <p>Chào ${fullName || "bạn"},</p>
      <p>Tài khoản của bạn đã <b>được mở khóa</b> và có thể đăng nhập lại bình thường.</p>
      <p>— FITNEXUS Team</p>
    `,
  };
}
