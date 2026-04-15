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
  adminGetSubcategories,
  adminCreateSubcategory,
  adminUpdateSubcategory,
  adminDeleteSubcategory,
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

// Subcategories
router.get('/subcategories', adminGetSubcategories);
router.post('/subcategories', adminCreateSubcategory);
router.put('/subcategories/:id', adminUpdateSubcategory);
router.delete('/subcategories/:id', adminDeleteSubcategory);

// Users
router.get('/users', adminGetUsers);

export default router;