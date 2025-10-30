// packages/backend/controllers/payment.controller.js
import axios from "axios";
import SubscriptionPlan from "../models/subscription.plan.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import dns from "dns";

dns.setDefaultResultOrder?.("ipv4first");

// === Helper: tạo mã orderCode ngắn, an toàn ===
function uniqueOrderCode() {
  const sec = Math.floor(Date.now() / 1000);
  const rand = Math.floor(Math.random() * 1000);
  return sec * 1000 + rand;
}

// === Tạo link thanh toán PayOS ===
export async function createPaymentLink(req, res) {
  try {
    const userId = req.userId || req.user?.user_id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { planId } = req.body || {};
    if (!planId)
      return res
        .status(400)
        .json({ success: false, message: "Missing planId" });

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || !plan.is_active)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });

    const orderCode = uniqueOrderCode();
    const tx = await Transaction.create({
      user_id: userId,
      plan_id: plan.plan_id,
      amount: plan.price,
      status: "pending",
      payos_order_code: orderCode,
    });

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Dữ liệu gửi lên PayOS
    const payload = {
      orderCode: Number(orderCode),
      amount: Number(plan.price),
      description: `Thanh toán gói ${plan.name}`,
      returnUrl: `${backendUrl}/api/payment/return`,
      cancelUrl: `${backendUrl}/api/payment/cancel`,
      items: [{ name: plan.name, quantity: 1, price: Number(plan.price) }],
    };

    const baseAPI =
      process.env.PAYOS_ENV === "sandbox"
        ? "https://api-sandbox.payos.vn"
        : "https://api.payos.vn";

    // === Thử gọi PayOS ===
    let resp;
    try {
      resp = await axios.post(`${baseAPI}/v1/payment-requests`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.PAYOS_CLIENT_ID,
          "x-api-key": process.env.PAYOS_API_KEY,
        },
        timeout: 10000,
      });
    } catch (err) {
      // fallback sang sandbox nếu lỗi mạng/DNS
      console.warn(
        "⚠️ PayOS prod unreachable, trying sandbox...",
        err?.code || err?.message
      );
      resp = await axios.post(
        "https://api-sandbox.payos.vn/v1/payment-requests",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.PAYOS_CLIENT_ID,
            "x-api-key": process.env.PAYOS_API_KEY,
          },
          timeout: 10000,
        }
      );
    }

    const data = resp?.data?.data || resp?.data || {};
    const checkoutUrl = data.checkoutUrl;
    const qrCode = data.qrCode;

    if (!checkoutUrl)
      throw new Error("PAYOS response missing checkoutUrl field.");

    return res.json({
      success: true,
      data: {
        checkoutUrl,
        qrCode,
        orderCode,
        transaction_id: tx.transaction_id,
      },
    });
  } catch (err) {
    console.error("createPaymentLink error:", err);
    return res.status(500).json({
      success: false,
      message: "PAYOS_CREATE_FAILED",
      detail: String(err?.message || err),
    });
  }
}

// === Xử lý webhook thanh toán PayOS ===
export async function handlePayosWebhook(req, res) {
  try {
    const data = req.body?.data || {};
    const orderCode = data?.orderCode;
    const status = String(data?.status || "").toUpperCase();
    if (!orderCode) return res.status(200).json({ success: true });

    const tx = await Transaction.findOne({
      where: { payos_order_code: orderCode },
    });
    if (!tx) return res.status(200).json({ success: true });

    if (status === "PAID") {
      const plan = await SubscriptionPlan.findByPk(tx.plan_id);
      if (plan) {
        const newExpiryDate = new Date();
        newExpiryDate.setDate(
          newExpiryDate.getDate() + Number(plan.duration_days || 30)
        );
        await User.update(
          { user_type: "premium", user_exp_date: newExpiryDate },
          { where: { user_id: tx.user_id } }
        );
        await tx.update({
          status: "completed",
          payos_payment_id: data.paymentId || null,
        });
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      await tx.update({ status: "failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("handlePayosWebhook error:", err);
    return res.status(400).json({ success: false, message: "Invalid webhook" });
  }
}

// === Redirect trả về sau khi thanh toán ===
export async function returnUrl(req, res) {
  try {
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontend}/payment/success`);
  } catch {
    return res.redirect("/");
  }
}

export async function cancelUrl(req, res) {
  try {
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontend}/payment/cancel`);
  } catch {
    return res.redirect("/");
  }
}
