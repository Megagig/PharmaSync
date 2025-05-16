import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  markExpenseAsPaid,
} from '../controllers/expense.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate as validateRequest } from '../middleware/validation.middleware';
import {
  expenseSchema,
  expenseUpdateSchema,
} from '../validations/expense.validation';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all expenses
router.get('/', getExpenses);

// Get expense by ID
router.get('/:id', getExpenseById);

// Create new expense
router.post('/', validateRequest(expenseSchema), createExpense);

// Update expense
router.patch('/:id', validateRequest(expenseUpdateSchema), updateExpense);

// Delete expense (Admin only)
router.delete('/:id', restrictTo([RoleType.ADMIN]), deleteExpense);

// Approve expense (Admin/Inventory Manager only)
router.patch(
  '/:id/approve',
  restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
  approveExpense
);

// Reject expense (Admin/Inventory Manager only)
router.patch(
  '/:id/reject',
  restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
  rejectExpense
);

// Mark expense as paid (Admin/Inventory Manager only)
router.patch(
  '/:id/pay',
  restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
  markExpenseAsPaid
);

export default router;
