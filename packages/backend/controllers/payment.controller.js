// packages/backend/controllers/payment.controller.js
import payos, { payosEnabled } from '../services/payos.client.js';
import SubscriptionPlan from '../models/subscription.plan.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

function uniqueOrderCode() {
  // Sufficiently unique for demo; consider adding random suffix to avoid collisions
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function createPaymentLink(req, res) {
  try {
    const userId = req.userId || req.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { planId } = req.body || {};
    if (!planId) return res.status(400).json({ success: false, message: 'Missing planId' });

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || !plan.is_active) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const orderCode = uniqueOrderCode();

    const tx = await Transaction.create({
      user_id: userId,
      plan_id: plan.plan_id,
      amount: plan.price,
      status: 'pending',
      payos_order_code: orderCode,
    });

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!payosEnabled) {
      // Mock mode: immediately mark as completed and upgrade the user
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + Number(plan.duration_days || 0));
      await User.update(
        { user_type: 'premium', user_exp_date: newExpiryDate },
        { where: { user_id: userId } }
      );
      await tx.update({ status: 'completed', payos_payment_id: 'mock' });
      return res.json({ success: true, data: { checkoutUrl: `${frontendUrl}/payment/success?mock=1`, orderCode, transaction_id: tx.transaction_id, mock: true } });
    }

    const paymentData = {
      orderCode,
      amount: plan.price,
      description: `Thanh toan goi ${plan.name}`,
      returnUrl: `${baseUrl}/api/payment/return`,
      cancelUrl: `${baseUrl}/api/payment/cancel`,
    };

    const paymentLink = await payos.createPaymentLink(paymentData);
    return res.json({ success: true, data: { checkoutUrl: paymentLink?.checkoutUrl, orderCode, transaction_id: tx.transaction_id } });
  } catch (err) {
    console.error('createPaymentLink error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function handlePayosWebhook(req, res) {
  try {
    if (!payosEnabled) {
      // In mock mode, webhook does nothing
      return res.status(200).json({ success: true });
    }
    // Verify webhook signature
    const verified = await payos.verifyPaymentWebhookData(req.body);
    const webhookData = verified?.data || req.body?.data || {};
    const orderCode = webhookData?.orderCode;
    if (!orderCode) return res.status(200).json({ success: true });

    const tx = await Transaction.findOne({ where: { payos_order_code: orderCode } });
    if (!tx) {
      // Unknown orderCode: acknowledge but ignore
      return res.status(200).json({ success: true });
    }
    if (tx.status === 'completed') {
      return res.status(200).json({ success: true });
    }

    const status = String(webhookData?.status || '').toUpperCase();

    if (status === 'PAID') {
      // Fetch plan and compute new expiry date (overwrite from now)
      const plan = await SubscriptionPlan.findByPk(tx.plan_id);
      if (!plan) {
        await tx.update({ status: 'failed' });
        return res.status(200).json({ success: true });
      }
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + Number(plan.duration_days || 0));

      // Update user: set user_type=premium and user_exp_date
      await User.update(
        { user_type: 'premium', user_exp_date: newExpiryDate },
        { where: { user_id: tx.user_id } }
      );

      await tx.update({ status: 'completed', payos_payment_id: webhookData?.paymentId || null });
    } else if (status === 'CANCELLED' || status === 'FAILED') {
      await tx.update({ status: 'failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('handlePayosWebhook error:', err);
    return res.status(400).json({ success: false, message: 'Invalid webhook' });
  }
}

export async function returnUrl(req, res) {
  try {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontend}/payment/success`);
  } catch {
    return res.redirect('/');
  }
}

export async function cancelUrl(req, res) {
  try {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontend}/payment/cancel`);
  } catch {
    return res.redirect('/');
  }
}
