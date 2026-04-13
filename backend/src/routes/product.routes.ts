import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoryById,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Protected routes - admin only
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
