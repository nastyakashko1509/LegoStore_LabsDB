import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { changeRole, listUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listUsers);

router.put(
  '/:userId/role',
  authenticate,
  authorize('admin'),
  [body('role').isIn(['client', 'employee', 'admin'])],
  changeRole
);

export default router;



