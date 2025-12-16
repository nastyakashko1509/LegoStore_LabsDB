import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { createOrder, listAllOrders, listOrderStatuses, listOrders, updateStatus } from '../controllers/orderController.js';

const router = Router();

router.post('/', authenticate, authorize('client'), createOrder);
router.get('/', authenticate, authorize('client'), listOrders);
router.get('/all', authenticate, authorize('admin', 'employee'), listAllOrders);
router.get('/statuses', authenticate, authorize('admin', 'employee'), listOrderStatuses);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'employee'),
  [
    body('statusId')
      // Принимаем любые UUID (v1-v7)
      .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
      .withMessage('Invalid statusId')
  ],
  updateStatus
);

export default router;

