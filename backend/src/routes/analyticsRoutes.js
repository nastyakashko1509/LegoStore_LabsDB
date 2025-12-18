import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { runAnalytics } from '../controllers/analyticsController.js';

const router = Router();

router.get('/:type', authenticate, authorize('admin', 'employee'), runAnalytics);

export default router;





