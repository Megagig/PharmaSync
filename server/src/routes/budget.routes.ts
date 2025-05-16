import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  activateBudget,
  closeBudget,
  updateBudgetActuals,
} from '../controllers/budget.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate as validateRequest } from '../middleware/validation.middleware';
import {
  budgetSchema,
  budgetUpdateSchema,
} from '../validations/budget.validation';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all budgets
router.get('/', getBudgets);

// Get budget by ID
router.get('/:id', getBudgetById);

// Create new budget
router.post('/', validateRequest(budgetSchema), createBudget);

// Update budget
router.patch('/:id', validateRequest(budgetUpdateSchema), updateBudget);

// Delete budget (Admin only)
router.delete('/:id', restrictTo([RoleType.ADMIN]), deleteBudget);

// Activate budget (Admin/Inventory Manager only)
router.patch(
  '/:id/activate',
  restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
  activateBudget
);

// Close budget (Admin/Inventory Manager only)
router.patch(
  '/:id/close',
  restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
  closeBudget
);

// Update budget actuals
router.patch('/:id/actuals', updateBudgetActuals);

export default router;
