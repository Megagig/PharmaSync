import { Router } from 'express';
import { getPaymentMethods } from '../controllers/paymentMethod.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', getPaymentMethods);

export default router; 