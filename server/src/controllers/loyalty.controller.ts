import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import CustomerLoyalty from '../models/customerLoyalty.model';
import LoyaltyProgram from '../models/loyaltyProgram.model';
import LoyaltyTier from '../models/loyaltyTier.model';
import { LoyaltyEventType } from '../interfaces/loyalty.interface';
import { AppError } from '../utils/error';
import * as loyaltyService from '../services/loyalty.service';

/**
 * Get customer loyalty information
 */
export const getCustomerLoyalty = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;

    const loyaltyInfo = await loyaltyService.getCustomerLoyalty(customerId);

    res.status(200).json({
      status: 'success',
      data: loyaltyInfo,
    });
  }
);

/**
 * Add loyalty points manually
 */
export const addLoyaltyPoints = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { points, description } = req.body;

    if (!points || points <= 0) {
      throw new AppError('Points must be a positive number', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get customer loyalty record or create if it doesn't exist
      let customerLoyalty = await CustomerLoyalty.findOne({ customer: customerId }).session(session);
      
      if (!customerLoyalty) {
        // Create new loyalty record for customer
        customerLoyalty = await CustomerLoyalty.create(
          [{
            customer: new mongoose.Types.ObjectId(customerId),
            totalPoints: 0,
            availablePoints: 0,
            redeemedPoints: 0,
            expiredPoints: 0,
            tier: 'Standard',
            events: [],
            lastActivity: new Date(),
          }],
          { session }
        );
        customerLoyalty = customerLoyalty[0];
      }

      // Add points to customer loyalty record
      customerLoyalty.events.push({
        eventType: LoyaltyEventType.MANUAL_ADJUSTMENT,
        points,
        description: description || 'Manual points adjustment',
        createdBy: req.user._id,
      });

      customerLoyalty.totalPoints += points;
      customerLoyalty.availablePoints += points;
      customerLoyalty.lastActivity = new Date();

      // Save changes
      await customerLoyalty.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        status: 'success',
        data: {
          awarded: true,
          points,
          totalPoints: customerLoyalty.totalPoints,
          availablePoints: customerLoyalty.availablePoints,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

/**
 * Redeem loyalty points
 */
export const redeemLoyaltyPoints = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { points, transactionId } = req.body;

    if (!points || points <= 0) {
      throw new AppError('Points must be a positive number', 400);
    }

    const result = await loyaltyService.redeemLoyaltyPoints(
      customerId,
      points,
      req.user._id.toString(),
      transactionId
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get loyalty program details
 */
export const getLoyaltyProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const loyaltyProgram = await LoyaltyProgram.findOne({ isActive: true });

    if (!loyaltyProgram) {
      throw new AppError('No active loyalty program found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: loyaltyProgram,
    });
  }
);

/**
 * Create loyalty program
 */
export const createLoyaltyProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      pointsPerCurrency,
      minimumPurchase,
      pointsValuation,
      expiryPeriod,
      isActive,
    } = req.body;

    // If creating an active program, deactivate all other programs
    if (isActive) {
      await LoyaltyProgram.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }

    const loyaltyProgram = await LoyaltyProgram.create({
      name,
      description,
      pointsPerCurrency,
      minimumPurchase,
      pointsValuation,
      expiryPeriod,
      isActive: isActive || false,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: loyaltyProgram,
    });
  }
);

/**
 * Update loyalty program
 */
export const updateLoyaltyProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      pointsPerCurrency,
      minimumPurchase,
      pointsValuation,
      expiryPeriod,
      isActive,
    } = req.body;

    // If activating this program, deactivate all other programs
    if (isActive) {
      await LoyaltyProgram.updateMany(
        { _id: { $ne: id }, isActive: true },
        { isActive: false }
      );
    }

    const loyaltyProgram = await LoyaltyProgram.findByIdAndUpdate(
      id,
      {
        name,
        description,
        pointsPerCurrency,
        minimumPurchase,
        pointsValuation,
        expiryPeriod,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!loyaltyProgram) {
      throw new AppError('Loyalty program not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: loyaltyProgram,
    });
  }
);

/**
 * Get loyalty tiers
 */
export const getLoyaltyTiers = asyncHandler(
  async (req: Request, res: Response) => {
    const tiers = await LoyaltyTier.find({ isActive: true })
      .sort({ minimumPoints: 1 });

    res.status(200).json({
      status: 'success',
      data: tiers,
    });
  }
);

/**
 * Create loyalty tier
 */
export const createLoyaltyTier = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      minimumPoints,
      pointsMultiplier,
      benefits,
      isActive,
    } = req.body;

    const tier = await LoyaltyTier.create({
      name,
      description,
      minimumPoints,
      pointsMultiplier,
      benefits,
      isActive: isActive || true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: tier,
    });
  }
);

/**
 * Update loyalty tier
 */
export const updateLoyaltyTier = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      minimumPoints,
      pointsMultiplier,
      benefits,
      isActive,
    } = req.body;

    const tier = await LoyaltyTier.findByIdAndUpdate(
      id,
      {
        name,
        description,
        minimumPoints,
        pointsMultiplier,
        benefits,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!tier) {
      throw new AppError('Loyalty tier not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: tier,
    });
  }
);

/**
 * Process expired points (admin only)
 */
export const processExpiredPoints = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await loyaltyService.processExpiredPoints();

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
