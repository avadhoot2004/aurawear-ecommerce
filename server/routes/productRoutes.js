import express from 'express';
import {
  getProducts,
  getProductById,
  getFilterMetadata,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/meta/filters', getFilterMetadata);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only product mutation routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
