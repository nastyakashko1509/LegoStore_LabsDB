import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['client', 'employee', 'admin'])
  ],
  register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  login
);

router.get('/me', authenticate, me);

export default router;





