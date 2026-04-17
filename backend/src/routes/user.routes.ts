import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  deleteUser,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// ── Public endpoints (no auth required) ──────────────────────────────────────
// Used by frontend after Supabase sign-in to fetch role without a chicken-egg problem
router.post('/', createUser);          // POST /api/users  — called by Register after signUp
router.get('/:id', getUserById);       // GET  /api/users/:id — called by Login to fetch role

// ── Admin-only endpoints ──────────────────────────────────────────────────────
router.use(authMiddleware, isAdmin);

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
