import express from 'express';
import { getCategories, getCategoryById, getSubcategories } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/:id', getCategoryById);

export default router;
