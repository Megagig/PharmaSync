import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import FinancialPeriod from '../models/financialPeriod.model';
import { FinancialPeriodStatus } from '../interfaces/accounting.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all financial periods
 * @route   GET /api/accounting/financial-periods
 * @access  Private
 */
export const getFinancialPeriods = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by fiscal year
    if (req.query.isFiscalYear) {
      filter.isFiscalYear = req.query.isFiscalYear === 'true';
    }

    // Get total count
    const total = await FinancialPeriod.countDocuments(filter);

    // Get financial periods with pagination
    const financialPeriods = await FinancialPeriod.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('closedBy', 'firstName lastName')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: financialPeriods,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get financial period by ID
 * @route   GET /api/accounting/financial-periods/:id
 * @access  Private
 */
export const getFinancialPeriodById = asyncHandler(
  async (req: Request, res: Response) => {
    const financialPeriod = await FinancialPeriod.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('closedBy', 'firstName lastName');

    if (!financialPeriod) {
      throw new AppError('Financial period not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: financialPeriod,
    });
  }
);

/**
 * @desc    Create new financial period
 * @route   POST /api/accounting/financial-periods
 * @access  Private
 */
export const createFinancialPeriod = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, startDate, endDate, isFiscalYear, notes } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Check for overlapping periods
    const overlappingPeriod = await FinancialPeriod.findOne({
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
      ],
    });

    if (overlappingPeriod) {
      throw new AppError(
        'Financial period overlaps with an existing period',
        400
      );
    }

    // Create financial period
    const financialPeriod = await FinancialPeriod.create({
      name,
      startDate: start,
      endDate: end,
      status: FinancialPeriodStatus.OPEN,
      isFiscalYear: isFiscalYear || false,
      notes,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: financialPeriod,
    });
  }
);

/**
 * @desc    Update financial period
 * @route   PATCH /api/accounting/financial-periods/:id
 * @access  Private
 */
export const updateFinancialPeriod = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, startDate, endDate, status, isFiscalYear, notes } = req.body;

    const financialPeriod = await FinancialPeriod.findById(req.params.id);

    if (!financialPeriod) {
      throw new AppError('Financial period not found', 404);
    }

    // Prevent updating closed or locked periods
    if (
      financialPeriod.status === FinancialPeriodStatus.CLOSED ||
      financialPeriod.status === FinancialPeriodStatus.LOCKED
    ) {
      throw new AppError(
        'Closed or locked financial periods cannot be modified',
        400
      );
    }

    // Validate dates if being updated
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new AppError('Start date must be before end date', 400);
      }

      // Check for overlapping periods
      const overlappingPeriod = await FinancialPeriod.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
          { startDate: { $gte: start, $lte: end } },
          { endDate: { $gte: start, $lte: end } },
        ],
      });

      if (overlappingPeriod) {
        throw new AppError(
          'Financial period overlaps with an existing period',
          400
        );
      }
    }

    // Update fields
    if (name) financialPeriod.name = name;
    if (startDate) financialPeriod.startDate = new Date(startDate);
    if (endDate) financialPeriod.endDate = new Date(endDate);
    if (status) financialPeriod.status = status;
    if (isFiscalYear !== undefined) financialPeriod.isFiscalYear = isFiscalYear;
    if (notes !== undefined) financialPeriod.notes = notes;

    await financialPeriod.save();

    res.status(200).json({
      status: 'success',
      data: financialPeriod,
    });
  }
);

/**
 * @desc    Close financial period
 * @route   PATCH /api/accounting/financial-periods/:id/close
 * @access  Private
 */
export const closeFinancialPeriod = asyncHandler(
  async (req: Request, res: Response) => {
    const financialPeriod = await FinancialPeriod.findById(req.params.id);

    if (!financialPeriod) {
      throw new AppError('Financial period not found', 404);
    }

    // Only open periods can be closed
    if (financialPeriod.status !== FinancialPeriodStatus.OPEN) {
      throw new AppError('Only open financial periods can be closed', 400);
    }

    // Update status
    financialPeriod.status = FinancialPeriodStatus.CLOSED;
    financialPeriod.closedBy = req.user.id; // From auth middleware
    financialPeriod.closedAt = new Date();

    await financialPeriod.save();

    res.status(200).json({
      status: 'success',
      data: financialPeriod,
    });
  }
);

/**
 * @desc    Lock financial period
 * @route   PATCH /api/accounting/financial-periods/:id/lock
 * @access  Private (Admin only)
 */
export const lockFinancialPeriod = asyncHandler(
  async (req: Request, res: Response) => {
    const financialPeriod = await FinancialPeriod.findById(req.params.id);

    if (!financialPeriod) {
      throw new AppError('Financial period not found', 404);
    }

    // Only closed periods can be locked
    if (financialPeriod.status !== FinancialPeriodStatus.CLOSED) {
      throw new AppError('Only closed financial periods can be locked', 400);
    }

    // Update status
    financialPeriod.status = FinancialPeriodStatus.LOCKED;

    await financialPeriod.save();

    res.status(200).json({
      status: 'success',
      data: financialPeriod,
    });
  }
);

/**
 * @desc    Delete financial period
 * @route   DELETE /api/accounting/financial-periods/:id
 * @access  Private (Admin only)
 */
export const deleteFinancialPeriod = asyncHandler(
  async (req: Request, res: Response) => {
    const financialPeriod = await FinancialPeriod.findById(req.params.id);

    if (!financialPeriod) {
      throw new AppError('Financial period not found', 404);
    }

    // Only open periods can be deleted
    if (financialPeriod.status !== FinancialPeriodStatus.OPEN) {
      throw new AppError('Only open financial periods can be deleted', 400);
    }

    // Delete financial period
    await financialPeriod.deleteOne();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);
