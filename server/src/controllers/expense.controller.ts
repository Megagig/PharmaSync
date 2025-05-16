import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/expense.model';
import Supplier from '../models/supplier.model';
import Location from '../models/location.model';
import { ExpenseStatus } from '../interfaces/expense.interface';
import { AppError } from '../utils/error';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

/**
 * @desc    Get all expenses with pagination and filtering
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationOptions(req);
    
    // Build filter object from query parameters
    const filter: any = {};
    
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' };
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }
    
    if (req.query.location) {
      filter.location = req.query.location;
    }
    
    if (req.query.isRecurring) {
      filter.isRecurring = req.query.isRecurring === 'true';
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    } else if (req.query.startDate) {
      filter.date = { $gte: new Date(req.query.startDate as string) };
    } else if (req.query.endDate) {
      filter.date = { $lte: new Date(req.query.endDate as string) };
    }
    
    // Count total documents
    const total = await Expense.countDocuments(filter);
    
    // Get expenses with pagination
    const expenses = await Expense.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('supplier', 'name supplierCode')
      .populate('location', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('rejectedBy', 'firstName lastName')
      .populate('parentExpense', 'expenseNumber');
    
    // Create pagination result
    const paginationResult = createPaginationResult(total, page, limit);
    
    res.status(200).json({
      status: 'success',
      data: expenses,
      meta: paginationResult,
    });
  }
);

/**
 * @desc    Get expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id)
      .populate('supplier', 'name supplierCode contactPerson email phone')
      .populate('location', 'name address')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .populate('parentExpense', 'expenseNumber title amount');
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: expense,
    });
  }
);

/**
 * @desc    Create new expense
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      amount,
      category,
      subcategory,
      date,
      dueDate,
      status,
      paymentMethod,
      paymentDate,
      paymentReference,
      supplier,
      location,
      notes,
      isRecurring,
      recurrenceInterval,
      recurrenceEndDate,
      parentExpense,
    } = req.body;
    
    // Verify related entities exist
    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        throw new AppError('Supplier not found', 404);
      }
    }
    
    if (location) {
      const locationExists = await Location.findById(location);
      if (!locationExists) {
        throw new AppError('Location not found', 404);
      }
    }
    
    if (parentExpense) {
      const parentExpenseExists = await Expense.findById(parentExpense);
      if (!parentExpenseExists) {
        throw new AppError('Parent expense not found', 404);
      }
    }
    
    // Create expense
    const expense = await Expense.create({
      title,
      description,
      amount,
      category,
      subcategory,
      date: date || new Date(),
      dueDate,
      status: status || ExpenseStatus.PENDING,
      paymentMethod,
      paymentDate,
      paymentReference,
      supplier: supplier || undefined,
      location: location || undefined,
      notes,
      isRecurring: isRecurring || false,
      recurrenceInterval,
      recurrenceEndDate,
      parentExpense: parentExpense || undefined,
      createdBy: req.user.id, // From auth middleware
    });
    
    res.status(201).json({
      status: 'success',
      data: expense,
    });
  }
);

/**
 * @desc    Update expense
 * @route   PATCH /api/expenses/:id
 * @access  Private
 */
export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    // Check if expense is already approved or paid
    if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
      throw new AppError('Cannot update approved or paid expenses', 400);
    }
    
    // Update expense
    Object.assign(expense, req.body);
    
    // Save updated expense
    await expense.save();
    
    res.status(200).json({
      status: 'success',
      data: expense,
    });
  }
);

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private (Admin only)
 */
export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    // Check if expense is already approved or paid
    if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
      throw new AppError('Cannot delete approved or paid expenses', 400);
    }
    
    await expense.deleteOne();
    
    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Approve expense
 * @route   PATCH /api/expenses/:id/approve
 * @access  Private (Admin/Manager only)
 */
export const approveExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    // Check if expense is already approved or paid
    if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
      throw new AppError('Expense is already approved or paid', 400);
    }
    
    // Update expense status
    expense.status = ExpenseStatus.APPROVED;
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    
    // Save updated expense
    await expense.save();
    
    res.status(200).json({
      status: 'success',
      data: expense,
    });
  }
);

/**
 * @desc    Reject expense
 * @route   PATCH /api/expenses/:id/reject
 * @access  Private (Admin/Manager only)
 */
export const rejectExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      throw new AppError('Rejection reason is required', 400);
    }
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    // Check if expense is already approved or paid
    if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
      throw new AppError('Cannot reject approved or paid expenses', 400);
    }
    
    // Update expense status
    expense.status = ExpenseStatus.REJECTED;
    expense.rejectedBy = req.user.id;
    expense.rejectedAt = new Date();
    expense.rejectionReason = rejectionReason;
    
    // Save updated expense
    await expense.save();
    
    res.status(200).json({
      status: 'success',
      data: expense,
    });
  }
);

/**
 * @desc    Mark expense as paid
 * @route   PATCH /api/expenses/:id/pay
 * @access  Private (Admin/Manager only)
 */
export const markExpenseAsPaid = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentMethod, paymentDate, paymentReference } = req.body;
    
    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    
    // Check if expense is already paid
    if (expense.status === ExpenseStatus.PAID) {
      throw new AppError('Expense is already paid', 400);
    }
    
    // Update expense status
    expense.status = ExpenseStatus.PAID;
    expense.paymentMethod = paymentMethod;
    expense.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    expense.paymentReference = paymentReference;
    
    // Save updated expense
    await expense.save();
    
    res.status(200).json({
      status: 'success',
      data: expense,
    });
  }
);
