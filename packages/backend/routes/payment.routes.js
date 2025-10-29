// packages/backend/routes/payment.routes.js
import { Router } from 'express';
import authGuard from '../middleware/auth.guard.js';
import { createPaymentLink, handlePayosWebhook, returnUrl, cancelUrl } from '../controllers/payment.controller.js';

const router = Router();

// Authenticated: create payOS payment link
router.post('/create-link', authGuard, createPaymentLink);

// payOS webhook (public but verified)
router.post('/payos-webhook', handlePayosWebhook);

// Redirect URLs (public)
router.get('/return', returnUrl);
router.get('/cancel', cancelUrl);

export default router;

