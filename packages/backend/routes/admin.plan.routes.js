// packages/backend/routes/admin.plan.routes.js
import express from 'express';
import authGuard from '../middleware/auth.guard.js';
import { requireAdmin } from '../middleware/role.guard.js';
import {
  listUserPlans,
  getUserPlan,
  updatePlanStatus,
  deletePlan
} from '../controllers/admin.plan.controller.js';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập và role ADMIN
router.use(authGuard);
router.use(requireAdmin);

// Danh sách plan của users
router.get('/user-plans', listUserPlans);

// Chi tiết 1 plan
router.get('/user-plans/:id', getUserPlan);

// Cập nhật status plan (ACTIVE/COMPLETED/CANCELLED)
router.put('/user-plans/:id/status', updatePlanStatus);

// Xóa plan 
router.delete('/user-plans/:id', deletePlan);

export default router;