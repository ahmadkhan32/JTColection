import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetUsers,
  adminGetAnalytics,
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, isAdmin);

// Dashboard analytics
router.get('/analytics', adminGetAnalytics);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

// Products
router.get('/products', adminGetProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// Categories
router.get('/categories', adminGetCategories);
router.post('/categories', adminCreateCategory);
router.put('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

// Users
router.get('/users', adminGetUsers);

export default router;