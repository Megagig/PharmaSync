import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PosSession from '../models/posSession.model';
import Location from '../models/location.model';
import { PosSessionStatus } from '../interfaces/posSession.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all POS sessions
 * @route   GET /api/pos/sessions
 * @access  Private
 */
export const getAllPosSessions = asyncHandler(
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

    // Filter by location
    if (req.query.location) {
      filter.location = req.query.location;
    }

    // Filter by user (opened by)
    if (req.query.user) {
      filter.openedBy = req.query.user;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.openingTime = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Get total count
    const total = await PosSession.countDocuments(filter);

    // Get sessions with pagination
    const sessions = await PosSession.find(filter)
      .populate('openedBy', 'firstName lastName')
      .populate('closedBy', 'firstName lastName')
      .populate('location', 'name')
      .sort({ openingTime: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: sessions,
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
 * @desc    Get POS session by ID
 * @route   GET /api/pos/sessions/:id
 * @access  Private
 */
export const getPosSessionById = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await PosSession.findById(req.params.id)
      .populate('openedBy', 'firstName lastName')
      .populate('closedBy', 'firstName lastName')
      .populate('location', 'name')
      .populate({
        path: 'transactions',
        select: 'saleNumber saleDate total paymentStatus',
        options: { sort: { saleDate: -1 } },
      });

    if (!session) {
      throw new AppError('POS session not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: session,
    });
  }
);

/**
 * @desc    Create new POS session
 * @route   POST /api/pos/sessions
 * @access  Private
 */
export const createPosSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { openingBalance, location, register, notes } = req.body;

    // Validate numeric fields
    if (isNaN(openingBalance) || openingBalance < 0) {
      throw new AppError(
        'Opening balance must be a valid non-negative number',
        400
      );
    }

    // Verify location exists
    const locationExists = await Location.findById(location);
    if (!locationExists) {
      throw new AppError('Location not found', 404);
    }

    // Check if there's already an open session for this register at this location
    const existingOpenSession = await PosSession.findOne({
      location,
      register,
      status: PosSessionStatus.OPEN,
    });

    if (existingOpenSession) {
      throw new AppError(
        'There is already an open session for this register at this location',
        400
      );
    }

    // Generate session number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const sessionNumber = `POS-${dateStr}-${randomStr}`;

    // Create session
    const session = await PosSession.create({
      openingBalance,
      location,
      register,
      notes,
      openedBy: req.user.id, // From auth middleware
      openingTime: new Date(),
      status: PosSessionStatus.OPEN,
      sessionNumber,
      expectedClosingBalance: openingBalance, // Initially set to opening balance
    });

    res.status(201).json({
      status: 'success',
      data: session,
    });
  }
);

/**
 * @desc    Close POS session
 * @route   PUT /api/pos/sessions/:id/close
 * @access  Private
 */
export const closePosSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { actualClosingBalance, notes } = req.body;

    const session = await PosSession.findById(req.params.id);

    if (!session) {
      throw new AppError('POS session not found', 404);
    }

    // Check if session is already closed
    if (session.status === PosSessionStatus.CLOSED) {
      throw new AppError('This POS session is already closed', 400);
    }

    // Update session
    session.status = PosSessionStatus.CLOSED;
    session.closingTime = new Date();
    session.actualClosingBalance = actualClosingBalance;
    session.closedBy = req.user.id; // From auth middleware

    if (notes) {
      session.notes = notes;
    }

    await session.save();

    res.status(200).json({
      status: 'success',
      data: session,
    });
  }
);

/**
 * @desc    Get active POS session for a register
 * @route   GET /api/pos/sessions/active
 * @access  Private
 */
export const getActivePosSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { location, register } = req.query;

    if (!location || !register) {
      throw new AppError('Location and register are required', 400);
    }

    const session = await PosSession.findOne({
      location,
      register,
      status: PosSessionStatus.OPEN,
    })
      .populate('openedBy', 'firstName lastName')
      .populate('location', 'name');

    res.status(200).json({
      status: 'success',
      data: session || null,
    });
  }
);

/**
 * @desc    Delete POS session
 * @route   DELETE /api/pos/sessions/:id
 * @access  Private (Admin only)
 */
export const deletePosSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await PosSession.findById(req.params.id);

    if (!session) {
      throw new AppError('POS session not found', 404);
    }

    // Check if session has transactions
    if (session.transactions && session.transactions.length > 0) {
      throw new AppError('Cannot delete a session with transactions', 400);
    }

    // Only allow deleting closed sessions or sessions with no transactions
    if (session.status === PosSessionStatus.OPEN) {
      throw new AppError(
        'Cannot delete an open session. Please close it first.',
        400
      );
    }

    await session.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'POS session deleted successfully',
    });
  }
);
