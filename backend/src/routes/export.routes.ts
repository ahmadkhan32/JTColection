import { Router } from 'express';
import { exportCSV, exportPDF } from '../controllers/export.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = Router();

// Both export endpoints are admin-only
router.get('/csv', authMiddleware, isAdmin, exportCSV);
router.get('/pdf', authMiddleware, isAdmin, exportPDF);

export default router;
