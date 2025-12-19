import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);

router.post(
  '/',
  authenticate,
  authorize('admin', 'employee'),
  [
    body('name').notEmpty(),
    body('price').isFloat({ gt: 0 }),
    body('ageLimit').isInt({ min: 0 }),
    body('categoryId').isUUID(),
    body('brandId').isUUID()
  ],
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'employee'),
  [
    body('name').notEmpty(),
    body('price').isFloat({ gt: 0 }),
    body('ageLimit').isInt({ min: 0 }),
    body('categoryId').isUUID(),
    body('brandId').isUUID()
  ],
  updateProduct
);

router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;









