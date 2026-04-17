import express from 'express';
import { createOrder, getOrderById, getUserOrders } from '../controllers/order.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Guest + logged-in users can place orders
router.post('/', optionalAuthMiddleware, createOrder);
router.post('/create', optionalAuthMiddleware, createOrder);

// Get single order by ID (no auth — needed for success page after guest checkout)
router.get('/:id', getOrderById);

router.get('/user/me', authMiddleware, getUserOrders);
router.get('/user/:userId', authMiddleware, isAdmin, getUserOrders);

export default router;
