import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from '../controllers/order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = express.Router();

// User routes
router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', authMiddleware, adminMiddleware, getOrderById);
router.put('/:id', authMiddleware, adminMiddleware, updateOrder);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

export default router;
