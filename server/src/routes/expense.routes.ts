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
import { validateRequest } from '../middleware/validation.middleware';
import { expenseSchema, expenseUpdateSchema } from '../validations/expense.validation';

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
router.delete('/:id', restrictTo('ADMIN'), deleteExpense);

// Approve expense (Admin/Manager only)
router.patch('/:id/approve', restrictTo('ADMIN', 'MANAGER'), approveExpense);

// Reject expense (Admin/Manager only)
router.patch('/:id/reject', restrictTo('ADMIN', 'MANAGER'), rejectExpense);

// Mark expense as paid (Admin/Manager only)
router.patch('/:id/pay', restrictTo('ADMIN', 'MANAGER'), markExpenseAsPaid);

export default router;
