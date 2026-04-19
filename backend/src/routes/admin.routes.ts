import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
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
  adminGetDashboard,
  adminGetUploadUrl,
  adminDeleteImage,
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, isAdmin);

// Dashboard (analytics + user roster)
// Router is mounted at /api/admin — so this resolves to GET /api/admin/dashboard
router.get('/dashboard', adminGetDashboard);
router.get('/analytics', adminGetAnalytics);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

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

// Upload: generate a signed URL for direct-to-Supabase uploads
router.post('/upload-url', adminGetUploadUrl);

// Images: delete a single image from Supabase Storage
router.delete('/images', adminDeleteImage);

export default router;