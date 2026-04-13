import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = express.Router();

// All user routes require admin authentication
router.use(authMiddleware, adminMiddleware);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
