import express from 'express';
import {
  getAllReturns,
  getReturnsByUser,
  getReturnByOrder,
  createReturn,
  updateReturn,
  deleteReturn,
} from '../controllers/return.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Customer — submit a return request
router.post('/', authMiddleware, createReturn);

// Customer — get their own return requests
router.get('/user/:userId', authMiddleware, getReturnsByUser);

// Customer / Admin — get return by order
router.get('/order/:orderId', authMiddleware, getReturnByOrder);

// Admin-only routes
router.get('/',    authMiddleware, isAdmin, getAllReturns);
router.put('/:id', authMiddleware, isAdmin, updateReturn);
router.delete('/:id', authMiddleware, isAdmin, deleteReturn);

export default router;
