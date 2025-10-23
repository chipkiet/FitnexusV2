// packages/backend/routes/admin.routes.js
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import activityTracker from "../middleware/activity.tracker.js";
import authGuard from '../middleware/auth.guard.js';
import { requireAdmin } from '../middleware/role.guard.js';

import {
  listUsers,
  updateUserRole,
  updateUserPlan,
  resetPassword,
  lockUser,
  unlockUser,
} from '../controllers/admin.controller.js';

// ⬇️ THÊM: controller cho admin phụ
import {
  listSubAdmins,
  createSubAdmin,
} from '../controllers/adminSub.controller.js';

const router = express.Router();

/** Lock / Unlock */
router.patch('/users/:id/lock',   authGuard, requireAdmin, lockUser);
router.patch('/users/:id/unlock', authGuard, requireAdmin, unlockUser);


/** GET /api/admin/health - ADMIN only */
router.get('/health', authGuard, requireAdmin, (_req, res) => {
  res.json({ success: true, message: 'Admin route OK', timestamp: new Date().toISOString() });
});

/** GET /api/admin/users - list users */
router.get(
  '/users',
  authGuard,
  requireAdmin,
  [
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 255 }),
    query('plan')
      .optional()
      .customSanitizer((v) => String(v).trim().toUpperCase())
      .isIn(['FREE', 'PREMIUM'])
      .withMessage('Invalid plan'),
    query('role')
      .optional()
      .customSanitizer((v) => String(v).trim().toUpperCase())
      .isIn(['USER', 'TRAINER', 'ADMIN'])
      .withMessage('Invalid role'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return listUsers(req, res, next);
  }
);

/** PATCH /api/admin/users/:id/role - update role */
router.patch(
  '/users/:id/role',
  authGuard,
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('role').isIn(['USER', 'TRAINER', 'ADMIN']).withMessage('Invalid role'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return updateUserRole(req, res, next);
  }
);

/** PATCH /api/admin/users/:id/plan - update subscription plan */
router.patch(
  '/users/:id/plan',
  authGuard,
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('plan')
      .customSanitizer((v) => String(v).trim().toUpperCase())
      .isIn(['FREE', 'PREMIUM'])
      .withMessage('Invalid plan'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return updateUserPlan(req, res, next);
  }
);

/** POST /api/admin/users/:userId/reset-password - admin sets a new password directly */
router.post(
  '/users/:userId/reset-password',
  authGuard,
  requireAdmin,
  [
    param('userId').isInt({ min: 1 }).toInt(),
    body('newPassword')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars')
      .matches(/[A-Z]/).withMessage('Need at least 1 uppercase letter')
      .matches(/[a-z]/).withMessage('Need at least 1 lowercase letter')
      .matches(/\d/).withMessage('Need at least 1 digit')
      .matches(/[\W_]/).withMessage('Need at least 1 special character'),
    body('confirmPassword')
      .custom((val, { req }) => val === req.body.newPassword)
      .withMessage('Passwords do not match'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return resetPassword(req, res, next);
  }
);

/** =========================
 *  SUB-ADMINS
 *  - GET  /api/admin/subadmins      → xem danh sách (admin chính & phụ đều xem được, phạm vi do controller quyết định)
 *  - POST /api/admin/subadmins      → tạo admin phụ (chỉ admin chính; controller sẽ trả 403 nếu không đủ quyền)
 * ========================= */

/** GET /api/admin/subadmins - list sub-admins */
router.get(
  '/subadmins',
  authGuard,
  requireAdmin,
  [
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return listSubAdmins(req, res, next);
  }
);

/** POST /api/admin/subadmins - create sub-admin (super admin only) */
router.post(
  '/subadmins',
  authGuard,
  requireAdmin,
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('username').isString().trim().isLength({ min: 3, max: 50 }).withMessage('Invalid username'),
    body('password')
      .isString()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 chars')
      .matches(/[A-Z]/).withMessage('Need at least 1 uppercase letter')
      .matches(/[a-z]/).withMessage('Need at least 1 lowercase letter')
      .matches(/\d/).withMessage('Need at least 1 digit')
      .matches(/[\W_]/).withMessage('Need at least 1 special character'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation error', errors: errors.array() });
    }
    return createSubAdmin(req, res, next);
  }
);


export default router;
