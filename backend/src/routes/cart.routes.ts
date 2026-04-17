import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/',       getCart);        // GET    /api/cart
router.post('/',      addToCart);      // POST   /api/cart
router.put('/:id',    updateCartItem); // PUT    /api/cart/:id
router.delete('/:id', removeCartItem); // DELETE /api/cart/:id
router.delete('/',    clearCart);      // DELETE /api/cart

export default router;
