import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { createOrUpdateReview, listMyReviews, listProductReviews } from '../controllers/reviewController.js';

const router = Router();

router.use(authenticate, authorize('client'));

router.post(
  '/',
  [
    body('productId')
      .matches(/^[0-9a-fA-F-]{36}$/)
      .withMessage('productId must be UUID'),
    body('comment').isLength({ min: 1 }).withMessage('comment required'),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  createOrUpdateReview
);

router.get('/me', listMyReviews);

router.get(
  '/product/:productId',
  [
    param('productId')
      .matches(/^[0-9a-fA-F-]{36}$/)
      .withMessage('productId must be UUID')
  ],
  listProductReviews
);

export default router;




