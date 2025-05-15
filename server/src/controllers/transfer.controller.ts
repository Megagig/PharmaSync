import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Transfer from '../models/Transfer';
import Product from '../models/product.model';
import Medication from '../models/medication.model';
import { AppError } from '../utils/error';
import { generateReferenceNumber } from '../utils/helpers';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Create a new transfer
 * @route   POST /api/transfers
 * @access  Private
 */
export const createTransfer = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sourceLocation, destinationLocation, items, notes } = req.body;
    const userId = req.user?._id;

    // Validate locations
    if (sourceLocation === destinationLocation) {
      throw new AppError('Source and destination locations cannot be the same', 400);
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('At least one item is required', 400);
    }

    // Create transfer
    const referenceNumber = await generateReferenceNumber('TRF');

    const transfer = new Transfer({
      referenceNumber,
      sourceLocation,
      destinationLocation,
      items,
      status: 'pending',
      notes,
      createdBy: userId,
    });

    await transfer.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: transfer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating transfer:', error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating transfer',
      error: (error as Error).message,
    });
  }
});

/**
 * @desc    Get all transfers
 * @route   GET /api/transfers
 * @access  Private
 */
export const getTransfers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      status,
      sourceLocation,
      destinationLocation,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (sourceLocation) {
      query.sourceLocation = sourceLocation;
    }

    if (destinationLocation) {
      query.destinationLocation = destinationLocation;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transfers = await Transfer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sourceLocation', 'name')
      .populate('destinationLocation', 'name')
      .populate('createdBy', 'name');

    const total = await Transfer.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        transfers,
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalTransfers: total,
      },
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching transfers',
      error: (error as Error).message,
    });
  }
});

/**
 * @desc    Get transfer by ID
 * @route   GET /api/transfers/:id
 * @access  Private
 */
export const getTransferById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findById(id)
      .populate('sourceLocation', 'name type')
      .populate('destinationLocation', 'name type')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: transfer,
    });
  } catch (error) {
    console.error('Error fetching transfer:', error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Error fetching transfer',
      error: (error as Error).message,
    });
  }
});
