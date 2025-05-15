import { Router } from 'express';
import {
  getCustomerCreditTransactions,
  getCustomerCreditSummary,
  createCreditTransaction,
  updateCustomerCreditLimit,
} from '../controllers/credit.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCreditTransactionSchema,
  updateCreditLimitSchema,
} from '../validators/credit.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router({ mergeParams: true });

// Protect all routes
router.use(protect);

// Get credit transactions and summary
router.get('/', getCustomerCreditTransactions);
router.get('/summary', getCustomerCreditSummary);

// Create credit transaction
router.post(
  '/',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createCreditTransactionSchema),
  createCreditTransaction
);

// Update credit limit
router.patch(
  '/limit',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updateCreditLimitSchema),
  updateCustomerCreditLimit
);

export default router;
