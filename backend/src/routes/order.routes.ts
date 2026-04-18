import express from 'express';
import { createOrder, getOrderById, getUserOrders, updateOrder, cancelOrder } from '../controllers/order.controller.js';
import { downloadInvoice } from '../controllers/invoice.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Place orders (guest + logged-in users)
router.post('/', optionalAuthMiddleware, createOrder);
router.post('/create', optionalAuthMiddleware, createOrder);

// User order history (must be before /:id)
router.get('/user/me', authMiddleware, getUserOrders);
router.get('/user/:userId', authMiddleware, isAdmin, getUserOrders);

// Invoice download (must be before /:id to avoid conflict)
router.get('/:id/invoice', downloadInvoice);

// Single order by ID (no auth — needed for success page after guest checkout)
router.get('/:id', getOrderById);

// Customer: edit shipping details or cancel (only if status = pending/confirmed)
router.put('/:id', optionalAuthMiddleware, updateOrder);
router.delete('/:id', optionalAuthMiddleware, cancelOrder);

export default router;

