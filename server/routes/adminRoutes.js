import express from 'express';
import {
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict protection on all admin routes
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
