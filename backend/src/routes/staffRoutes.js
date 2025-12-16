import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { registerSupply, listSupplyStatuses, listSupplies, listSupplyItems, updateSupplyStatus, deleteSupply } from '../controllers/supplyController.js';
import { setProductDiscount, updateProductPrice } from '../controllers/priceController.js';
import { listCustomers, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = Router();

router.use(authenticate, authorize('admin', 'employee'));

// Customers CRUD (basic)
router.get('/customers', listCustomers);
router.put(
  '/customers/:id',
  [
    param('id').matches(/^[0-9a-fA-F-]{36}$/),
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty()
  ],
  updateCustomer
);
router.delete('/customers/:id', [param('id').matches(/^[0-9a-fA-F-]{36}$/)], deleteCustomer);

// Supplies
router.get('/supplies', listSupplies);
router.get('/supplies/:id/items', [param('id').matches(/^[0-9a-fA-F-]{36}$/)], listSupplyItems);
router.post(
  '/supplies',
  [
    body('supplierId').matches(/^[0-9a-fA-F-]{36}$/),
    body('supplyDate').notEmpty(),
    body('statusName').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').matches(/^[0-9a-fA-F-]{36}$/),
    body('items.*.quantity').isInt({ gt: 0 }),
    body('items.*.unit_cost').isFloat({ gt: 0 })
  ],
  registerSupply
);
router.get('/supplies/statuses', listSupplyStatuses);
router.patch(
  '/supplies/:id',
  [
    param('id').matches(/^[0-9a-fA-F-]{36}$/),
    body('statusName').notEmpty()
  ],
  updateSupplyStatus
);
router.delete(
  '/supplies/:id',
  [param('id').matches(/^[0-9a-fA-F-]{36}$/)],
  deleteSupply
);

// Discounts and price updates
router.post(
  '/discounts',
  [
    body('productId').matches(/^[0-9a-fA-F-]{36}$/),
    body('percent').isFloat({ gt: 0, lte: 100 }),
    body('startDate').notEmpty(),
    body('endDate').notEmpty()
  ],
  setProductDiscount
);

router.post(
  '/prices',
  [
    body('productId').matches(/^[0-9a-fA-F-]{36}$/),
    body('newPrice').isFloat({ gt: 0 })
  ],
  updateProductPrice
);

export default router;




