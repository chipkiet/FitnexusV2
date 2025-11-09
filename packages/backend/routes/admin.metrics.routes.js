import express from 'express';
import authGuard from '../middleware/auth.guard.js';
import permissionGuard from '../middleware/permission.guard.js';
import { getOverviewMetrics } from '../controllers/admin.metrics.controller.js';

const router = express.Router();

// Unified admin dashboard metrics
router.get('/overview', authGuard, permissionGuard('read:admin_dashboard'), getOverviewMetrics);

export default router;

