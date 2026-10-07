import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes require authentication

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItemQuantity);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
