import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoryById,
  getProductVariations,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/variations', getProductVariations);

// Protected routes - admin only
router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

export default router;
