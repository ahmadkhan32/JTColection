import express from 'express';
import {
  getAllShipping,
  getShippingByOrder,
  getShippingByUser,
  createShipping,
  updateShipping,
  deleteShipping,
} from '../controllers/shipping.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Public / customer — get shipping for a specific order
router.get('/order/:orderId', authMiddleware, getShippingByOrder);

// Customer — get their own shipping records
router.get('/user/:userId', authMiddleware, getShippingByUser);

// Admin-only routes
router.get('/',    authMiddleware, isAdmin, getAllShipping);
router.post('/',   authMiddleware, isAdmin, createShipping);
router.put('/:id', authMiddleware, isAdmin, updateShipping);
router.delete('/:id', authMiddleware, isAdmin, deleteShipping);

export default router;
