// utils/emailTemplates.js
export function buildResetPasswordEmail({
  name = "bạn",
  resetUrl,
  ttlMin = 30,
  brand = "FitNexus",
}) {
  const subject = "Khôi phục mật khẩu";

  const text = `Khôi phục mật khẩu

Xin chào, ${name}
Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản ${brand}.

Mở liên kết sau để đặt lại (hết hạn sau ${ttlMin} phút):
${resetUrl}

Nếu không phải bạn, hãy bỏ qua email này.`;


  const html = `
  <!doctype html>
  <html lang="vi">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body{margin:0;background:#f5f7fb}
      .wrap{padding:28px 12px}
      .card{
        max-width:760px;margin:0 auto;background:#ffffff;
        border:1px solid #e5e7eb;border-radius:16px;
        box-shadow:0 4px 20px rgba(17,24,39,.06)
      }
      .inner{padding:28px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}
      .title{margin:0 0 18px;font-weight:800;font-size:22px;line-height:1.2;color:#111827}
      .subtitle{margin:0 0 22px;color:#6b7280;font-size:14px}
      .p{margin:10px 0;font-size:15px;line-height:1.6}
      .section{margin:26px 0 8px;border-top:1px solid #e5e7eb;padding-top:18px}
      .muted{color:#6b7280;font-size:13px;line-height:1.6;margin:8px 0}
      .link{color:#111827;word-break:break-all;font-size:13px}
      b,strong{font-weight:700}
      .brand{font-weight:700;color:#111827}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="inner">
          <h1 class="title">Khôi phục mật khẩu</h1>
          <p class="subtitle">Nhấn nút bên dưới để đặt lại mật khẩu cho tài khoản của bạn.</p>

          <p class="p">Xin chào, <b>${escapeHtml(name)}</b></p>
          <p class="p">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản <span class="brand">${escapeHtml(brand)}</span>.</p>

          <!-- BULLETPROOF BUTTON -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">
            <tr>
              <td align="left" bgcolor="#2563eb" style="border-radius:10px;">
                <a href="${resetUrl}"
                   target="_blank" rel="noopener"
                   style="display:inline-block;padding:12px 18px;
                          font-weight:700;font-size:14px;
                          color:#ffffff;text-decoration:none;
                          border-radius:10px;background:#2563eb;">
                  Đặt lại mật khẩu
                </a>
              </td>
            </tr>
          </table>

          <div class="section">
            <p class="muted">Liên kết này sẽ hết hạn sau ${ttlMin} phút. Nếu không phải bạn, hãy bỏ qua email này.</p>
            <p class="muted">Nếu nút không hoạt động, sao chép liên kết sau:</p>
            <p class="link">${resetUrl}</p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  return { subject, text, html };
}

// Vietnamese Premium upgrade email (AI coach wording) – new version with validity range and no CTA
export function buildPremiumUpgradedEmailVn2({
  name = "bạn",
  upgradedAt,
  expiresAt,
  dashboardUrl, // ignored
  brand = "Fitnexus",
  supportEmail = process.env.SMTP_USER,
  websiteUrl = process.env.FRONTEND_URL || "https://fitnexus.app",
}) {
  const upgradedStr = new Date(upgradedAt || Date.now()).toLocaleDateString("vi-VN");
  const expiresStr = expiresAt ? new Date(expiresAt).toLocaleDateString("vi-VN") : null;
  const subject = "Chúc mừng! Bạn đã nâng cấp lên Fitnexus Premium";

  const text = `Chúc mừng! Bạn đã nâng cấp lên Fitnexus Premium\n\nKính gửi ${name},\n\nChúng tôi rất vui mừng thông báo rằng tài khoản của bạn trên ${brand} đã được nâng cấp thành công lên ${brand} Premium!\n\nCác quyền lợi bạn nhận được từ ${brand} Premium:\n- Truy cập không giới hạn vào tất cả các chương trình tập luyện và kế hoạch đào tạo\n- Huấn luyện AI cá nhân hóa theo mục tiêu và thể trạng\n- Cập nhật các bài tập mới và chương trình theo xu hướng\n- Trải nghiệm không có quảng cáo, tập trung vào mục tiêu của bạn\n- Theo dõi tiến độ và phân tích chi tiết các hoạt động luyện tập\n- Và nhiều tính năng đặc biệt khác!\n\nChúng tôi rất cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ ${brand}. Chúng tôi hy vọng bạn sẽ tận hưởng một trải nghiệm tuyệt vời với gói Premium của mình.\n\nThông tin tài khoản của bạn:\n- Gói dịch vụ: ${brand} Premium\n- Hiệu lực: ${upgradedStr}${expiresStr ? ` — ${expiresStr}` : ''}\n- Trạng thái: Premium\n\nNếu bạn cần hỗ trợ, hãy trả lời email này hoặc truy cập ${websiteUrl}.\n\nTrân trọng,\nĐội ngũ ${brand}\nEmail hỗ trợ: ${supportEmail || "support@fitnexus.app"}\nTrang web: ${websiteUrl}`;

  const html = `<!doctype html>
  <html lang="vi">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body{margin:0;background:#f5f7fb}
      .wrap{padding:28px 12px}
      .card{max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 4px 20px rgba(17,24,39,.06)}
      .inner{padding:28px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}
      .title{margin:0 0 18px;font-weight:800;font-size:22px;line-height:1.2;color:#111827}
      .p{margin:10px 0;font-size:15px;line-height:1.6}
      .section{margin:26px 0 8px;border-top:1px solid #e5e7eb;padding-top:18px}
      .muted{color:#6b7280;font-size:13px;line-height:1.6;margin:8px 0}
      .link{color:#111827;word-break:break-all;font-size:13px}
      b,strong{font-weight:700}
      .brand{font-weight:700;color:#111827}
      ul{margin:10px 0 0 18px;padding:0}
      li{margin:6px 0}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="inner">
          <h1 class="title">Chúc mừng! Bạn đã nâng cấp lên ${escapeHtml(brand)} Premium</h1>
          <p class="p">Kính gửi <b>${escapeHtml(name)}</b>,</p>
          <p class="p">Chúng tôi rất vui mừng thông báo rằng tài khoản của bạn trên <span class="brand">${escapeHtml(brand)}</span> đã được nâng cấp thành công lên <b>${escapeHtml(brand)} Premium</b>!</p>

          <p class="p"><b>Các quyền lợi bạn nhận được:</b></p>
          <ul>
            <li>Truy cập không giới hạn vào tất cả các chương trình tập luyện và kế hoạch đào tạo</li>
            <li>Huấn luyện AI cá nhân hóa theo mục tiêu và thể trạng</li>
            <li>Cập nhật các bài tập mới và chương trình luyện tập theo xu hướng</li>
            <li>Trải nghiệm không có quảng cáo, giúp bạn tập trung vào mục tiêu</li>
            <li>Theo dõi tiến độ và phân tích chi tiết các hoạt động luyện tập</li>
            <li>Và nhiều tính năng đặc biệt khác!</li>
          </ul>

          <p class="p">Chúng tôi rất cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ ${escapeHtml(brand)}. Chúng tôi hy vọng bạn sẽ tận hưởng một trải nghiệm tuyệt vời với gói Premium của mình.</p>

          <div class="section">
            <p class="p"><b>Thông tin tài khoản của bạn</b></p>
            <ul>
              <li><b>Gói dịch vụ:</b> ${escapeHtml(brand)} Premium</li>
              <li><b>Hiệu lực:</b> ${escapeHtml(upgradedStr)}${expiresStr ? ` — ${escapeHtml(expiresStr)}` : ''}</li>
              <li><b>Trạng thái:</b> Premium</li>
            </ul>
          </div>

          <div class="section">
            <p class="muted">Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ thêm, vui lòng trả lời email này hoặc truy cập trang hỗ trợ của chúng tôi.</p>
            <p class="muted">Email hỗ trợ: ${escapeHtml(supportEmail || 'support@fitnexus.app')}<br/>Trang web: <span class="link">${escapeHtml(websiteUrl)}</span></p>
          </div>

          <p class="p">Trân trọng,<br/>Đội ngũ ${escapeHtml(brand)}</p>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  return { subject, text, html };
}

export function buildEmailOtpTemplate({ name = "bạn", code, brand = "FitNexus", ttlMin = 10 }) {
  const subject = "Mã xác minh email";
  const text = `Xin chào ${name},

Mã xác minh tài khoản ${brand} của bạn là: ${code}
Mã sẽ hết hạn sau ${ttlMin} phút.

Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.`;

  const html = `
    <!doctype html><html lang="vi"><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body{margin:0;background:#f5f7fb}
      .wrap{padding:28px 12px}
      .card{max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 4px 20px rgba(17,24,39,.06)}
      .inner{padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}
      .title{margin:0 0 14px;font-weight:800;font-size:20px}
      .p{margin:10px 0;font-size:15px;line-height:1.6}
      .code{display:inline-block;font-weight:800;font-size:24px;letter-spacing:6px;background:#eef2ff;color:#1e3a8a;padding:12px 16px;border-radius:10px}
      .muted{color:#6b7280;font-size:13px;margin-top:14px}
    </style></head>
    <body><div class="wrap"><div class="card"><div class="inner">
      <h1 class="title">Mã xác minh email</h1>
      <p class="p">Xin chào <b>${escapeHtml(name)}</b>,</p>
      <p class="p">Mã xác minh tài khoản <b>${escapeHtml(brand)}</b> của bạn:</p>
      <p class="p"><span class="code">${code}</span></p>
      <p class="muted">Mã sẽ hết hạn sau ${ttlMin} phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
    </div></div></div></body></html>
  `;
  return { subject, text, html };
}

function escapeHtml(s=""){
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
