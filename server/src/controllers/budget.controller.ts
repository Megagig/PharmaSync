import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Budget from '../models/budget.model';
import Expense from '../models/expense.model';
import Location from '../models/location.model';
import { BudgetStatus } from '../interfaces/budget.interface';
import { ExpenseStatus } from '../interfaces/expense.interface';
import { AppError } from '../utils/error';
import {
  getPaginationOptions,
  createPaginationResult,
} from '../utils/pagination';

/**
 * @desc    Get all budgets with pagination and filtering
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sort, filter } = getPaginationOptions(req);

  // Add custom filters
  if (req.query.title) {
    filter.title = { $regex: req.query.title, $options: 'i' };
  }

  if (req.query.period) {
    filter.period = req.query.period;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.location) {
    filter.location = req.query.location;
  }

  if (req.query.startDate) {
    filter.startDate = { $gte: new Date(req.query.startDate as string) };
  }

  if (req.query.endDate) {
    filter.endDate = { $lte: new Date(req.query.endDate as string) };
  }

  // Count total documents
  const total = await Budget.countDocuments(filter);

  // Get budgets with pagination
  const budgets = await Budget.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('location', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .populate('closedBy', 'firstName lastName');

  // Create pagination result
  const paginationResult = createPaginationResult(budgets, total, {
    page,
    limit,
    skip,
    sort,
    filter,
  });

  res.status(200).json({
    status: 'success',
    data: budgets,
    meta: paginationResult,
  });
});

/**
 * @desc    Get budget by ID
 * @route   GET /api/budgets/:id
 * @access  Private
 */
export const getBudgetById = asyncHandler(
  async (req: Request, res: Response) => {
    const budget = await Budget.findById(req.params.id)
      .populate('location', 'name address')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('closedBy', 'firstName lastName email');

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: budget,
    });
  }
);

/**
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const createBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      period,
      startDate,
      endDate,
      status,
      items,
      notes,
      location,
    } = req.body;

    // Verify location exists if provided
    if (location) {
      const locationExists = await Location.findById(location);
      if (!locationExists) {
        throw new AppError('Location not found', 404);
      }
    }

    // Calculate total budget
    const totalBudget = items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );

    // Create budget
    const budget = await Budget.create({
      title,
      description,
      period,
      startDate,
      endDate,
      status: status || BudgetStatus.DRAFT,
      totalBudget,
      totalActual: 0,
      totalVariance: -totalBudget, // Initially, variance is negative (under budget)
      items,
      notes,
      location: location || undefined,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: budget,
    });
  }
);

/**
 * @desc    Update budget
 * @route   PATCH /api/budgets/:id
 * @access  Private
 */
export const updateBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    // Check if budget is already active or closed
    if (
      budget.status === BudgetStatus.ACTIVE ||
      budget.status === BudgetStatus.CLOSED
    ) {
      throw new AppError('Cannot update active or closed budgets', 400);
    }

    // Update budget
    Object.assign(budget, req.body);

    // Recalculate total budget if items are updated
    if (req.body.items) {
      budget.totalBudget = req.body.items.reduce(
        (sum: number, item: any) => sum + item.amount,
        0
      );
      budget.totalVariance = budget.totalActual - budget.totalBudget;
    }

    // Save updated budget
    await budget.save();

    res.status(200).json({
      status: 'success',
      data: budget,
    });
  }
);

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private (Admin only)
 */
export const deleteBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    // Check if budget is already active or closed
    if (
      budget.status === BudgetStatus.ACTIVE ||
      budget.status === BudgetStatus.CLOSED
    ) {
      throw new AppError('Cannot delete active or closed budgets', 400);
    }

    await budget.deleteOne();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Activate budget
 * @route   PATCH /api/budgets/:id/activate
 * @access  Private (Admin/Manager only)
 */
export const activateBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    // Check if budget is already active or closed
    if (budget.status === BudgetStatus.ACTIVE) {
      throw new AppError('Budget is already active', 400);
    }

    if (budget.status === BudgetStatus.CLOSED) {
      throw new AppError('Cannot activate a closed budget', 400);
    }

    // Update budget status
    budget.status = BudgetStatus.ACTIVE;
    budget.approvedBy = req.user.id;
    budget.approvedAt = new Date();

    // Save updated budget
    await budget.save();

    res.status(200).json({
      status: 'success',
      data: budget,
    });
  }
);

/**
 * @desc    Close budget
 * @route   PATCH /api/budgets/:id/close
 * @access  Private (Admin/Manager only)
 */
export const closeBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    throw new AppError('Budget not found', 404);
  }

  // Check if budget is already closed
  if (budget.status === BudgetStatus.CLOSED) {
    throw new AppError('Budget is already closed', 400);
  }

  // Update budget status
  budget.status = BudgetStatus.CLOSED;
  budget.closedBy = req.user.id;
  budget.closedAt = new Date();

  // Save updated budget
  await budget.save();

  res.status(200).json({
    status: 'success',
    data: budget,
  });
});

/**
 * @desc    Update budget actuals
 * @route   PATCH /api/budgets/:id/actuals
 * @access  Private
 */
export const updateBudgetActuals = asyncHandler(
  async (req: Request, res: Response) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    // Get all paid expenses within the budget period
    const expenses = await Expense.find({
      status: ExpenseStatus.PAID,
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate,
      },
      ...(budget.location && { location: budget.location }),
    });

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc: any, expense) => {
      const key = `${expense.category}${
        expense.subcategory ? `-${expense.subcategory}` : ''
      }`;

      if (!acc[key]) {
        acc[key] = {
          category: expense.category,
          subcategory: expense.subcategory,
          amount: 0,
        };
      }

      acc[key].amount += expense.amount;
      return acc;
    }, {});

    // Create actuals array
    const actuals = Object.values(expensesByCategory).map((actual: any) => {
      // Find corresponding budget item
      const budgetItem = budget.items.find(
        (item) =>
          item.category === actual.category &&
          (item.subcategory || '') === (actual.subcategory || '')
      );

      const budgetAmount = budgetItem ? budgetItem.amount : 0;
      const variance = actual.amount - budgetAmount;
      const variancePercentage =
        budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

      return {
        category: actual.category,
        subcategory: actual.subcategory,
        amount: actual.amount,
        variance,
        variancePercentage,
      };
    });

    // Add budget items with no actuals
    budget.items.forEach((item) => {
      const key = `${item.category}${
        item.subcategory ? `-${item.subcategory}` : ''
      }`;

      if (!expensesByCategory[key]) {
        actuals.push({
          category: item.category,
          subcategory: item.subcategory,
          amount: 0,
          variance: -item.amount,
          variancePercentage: -100,
        });
      }
    });

    // Calculate totals
    const totalActual = actuals.reduce(
      (sum, actual: any) => sum + actual.amount,
      0
    );
    const totalVariance = totalActual - budget.totalBudget;

    // Update budget
    // Set the actuals directly using set method to avoid type issues
    budget.set('actuals', actuals);
    budget.totalActual = totalActual;
    budget.totalVariance = totalVariance;

    // Save updated budget
    await budget.save();

    res.status(200).json({
      status: 'success',
      data: budget,
    });
  }
);
