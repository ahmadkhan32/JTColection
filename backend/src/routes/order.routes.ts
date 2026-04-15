import express from 'express';
import { createOrder, getUserOrders } from '../controllers/order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.post('/create', authMiddleware, createOrder);

router.get('/user/me', authMiddleware, getUserOrders);
router.get('/user/:id', authMiddleware, isAdmin, getUserOrders);

export default router;
