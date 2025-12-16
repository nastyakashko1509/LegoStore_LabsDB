import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { changeUserRole, listLogs, listUsers } from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', listUsers);
router.put(
  '/users/:userId/role',
  [
    param('userId').matches(/^[0-9a-fA-F-]{36}$/),
    body('role').isIn(['client', 'employee', 'admin'])
  ],
  changeUserRole
);

router.get('/logs', listLogs);

export default router;


