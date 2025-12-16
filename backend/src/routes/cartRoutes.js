import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { addToCart, clearCart, getCart, removeItem, updateQuantity } from '../controllers/cartController.js';

const router = Router();

router.use(authenticate, authorize('client'));

router.get('/', getCart);

router.post(
  '/',
  [
    body('productId')
      // Разрешаем UUID любых версий, включая v1 из сидированных данных
      .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
      .withMessage('productId must be UUID'),
    body('quantity').isInt({ gt: 0 })
  ],
  addToCart
);

router.put(
  '/',
  [
    body('productId')
      .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
      .withMessage('productId must be UUID'),
    body('quantity').isInt({ gt: 0 })
  ],
  updateQuantity
);

router.delete('/:productId', removeItem);
router.delete('/', clearCart);

export default router;

