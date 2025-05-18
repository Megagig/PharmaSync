import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import { redisClient } from '../config/redis';
import CustomerLoyalty from '../models/customerLoyalty.model';
import LoyaltyProgram from '../models/loyaltyProgram.model';
import LoyaltyTier from '../models/loyaltyTier.model';
import Customer from '../models/customer.model';
import { LoyaltyEventType } from '../interfaces/loyalty.interface';
import logger from '../utils/logger';
import { toObjectId } from '../utils/idConverter';

/**
 * Calculate loyalty points for a purchase
 */
export const calculatePurchasePoints = async (
  customerId: string,
  amount: number,
  userId: string,
  transactionId?: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get active loyalty program
    const loyaltyProgram = await LoyaltyProgram.findOne({ isActive: true }).session(session);
    if (!loyaltyProgram) {
      // No active loyalty program, so no points awarded
      await session.abortTransaction();
      return { awarded: false, points: 0 };
    }

    // Check if purchase meets minimum amount
    if (amount < loyaltyProgram.minimumPurchase) {
      await session.abortTransaction();
      return { awarded: false, points: 0, reason: 'Purchase amount below minimum required' };
    }

    // Calculate points
    const pointsEarned = Math.floor(amount * loyaltyProgram.pointsPerCurrency);
    if (pointsEarned <= 0) {
      await session.abortTransaction();
      return { awarded: false, points: 0, reason: 'No points earned for this purchase' };
    }

    // Get customer loyalty record or create if it doesn't exist
    let customerLoyalty = await CustomerLoyalty.findOne({ customer: customerId }).session(session);
    
    if (!customerLoyalty) {
      // Create new loyalty record for customer
      customerLoyalty = await CustomerLoyalty.create(
        [{
          customer: toObjectId(customerId),
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

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + loyaltyProgram.expiryPeriod);

    // Add points to customer loyalty record
    customerLoyalty.events.push({
      eventType: LoyaltyEventType.PURCHASE,
      points: pointsEarned,
      transaction: transactionId ? toObjectId(transactionId) : undefined,
      description: `Points earned from purchase`,
      expiryDate,
      createdBy: toObjectId(userId),
    });

    customerLoyalty.totalPoints += pointsEarned;
    customerLoyalty.availablePoints += pointsEarned;
    customerLoyalty.lastActivity = new Date();

    // Update customer tier if needed
    await updateCustomerTier(customerLoyalty, session);

    // Save changes
    await customerLoyalty.save({ session });

    // Clear cache
    if (redisClient.isOpen) {
      await redisClient.del(`customer:${customerId}:loyalty`);
    }

    await session.commitTransaction();
    
    return {
      awarded: true,
      points: pointsEarned,
      totalPoints: customerLoyalty.totalPoints,
      availablePoints: customerLoyalty.availablePoints,
      tier: customerLoyalty.tier,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in calculatePurchasePoints:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Redeem loyalty points
 */
export const redeemLoyaltyPoints = async (
  customerId: string,
  pointsToRedeem: number,
  userId: string,
  transactionId?: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get customer loyalty record
    const customerLoyalty = await CustomerLoyalty.findOne({ customer: customerId }).session(session);
    
    if (!customerLoyalty) {
      throw new AppError('Customer has no loyalty record', 404);
    }

    // Check if customer has enough points
    if (customerLoyalty.availablePoints < pointsToRedeem) {
      throw new AppError(`Insufficient points. Available: ${customerLoyalty.availablePoints}`, 400);
    }

    // Get active loyalty program for points valuation
    const loyaltyProgram = await LoyaltyProgram.findOne({ isActive: true }).session(session);
    if (!loyaltyProgram) {
      throw new AppError('No active loyalty program found', 404);
    }

    // Calculate redemption value
    const redemptionValue = pointsToRedeem * loyaltyProgram.pointsValuation;

    // Add redemption event
    customerLoyalty.events.push({
      eventType: LoyaltyEventType.REDEMPTION,
      points: -pointsToRedeem, // Negative points for redemption
      transaction: transactionId ? toObjectId(transactionId) : undefined,
      description: `Points redeemed for purchase`,
      createdBy: toObjectId(userId),
    });

    // Update points
    customerLoyalty.availablePoints -= pointsToRedeem;
    customerLoyalty.redeemedPoints += pointsToRedeem;
    customerLoyalty.lastActivity = new Date();

    // Save changes
    await customerLoyalty.save({ session });

    // Clear cache
    if (redisClient.isOpen) {
      await redisClient.del(`customer:${customerId}:loyalty`);
    }

    await session.commitTransaction();
    
    return {
      redeemed: true,
      points: pointsToRedeem,
      value: redemptionValue,
      availablePoints: customerLoyalty.availablePoints,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in redeemLoyaltyPoints:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update customer loyalty tier based on points
 */
const updateCustomerTier = async (customerLoyalty: any, session: mongoose.ClientSession) => {
  // Get all active tiers sorted by minimum points (descending)
  const tiers = await LoyaltyTier.find({ isActive: true })
    .sort({ minimumPoints: -1 })
    .session(session);

  if (!tiers || tiers.length === 0) {
    return; // No tiers defined, keep current tier
  }

  // Find the highest tier the customer qualifies for
  const qualifyingTier = tiers.find(tier => customerLoyalty.totalPoints >= tier.minimumPoints);
  
  if (qualifyingTier && qualifyingTier.name !== customerLoyalty.tier) {
    // Update customer tier
    customerLoyalty.tier = qualifyingTier.name;
    
    // Add tier change event
    customerLoyalty.events.push({
      eventType: LoyaltyEventType.MANUAL_ADJUSTMENT,
      points: 0, // No points change for tier update
      description: `Tier upgraded to ${qualifyingTier.name}`,
      createdBy: customerLoyalty.customer, // System update
    });
  }
};

/**
 * Get customer loyalty information
 */
export const getCustomerLoyalty = async (customerId: string) => {
  try {
    // Try to get from cache
    if (redisClient.isOpen) {
      const cachedLoyalty = await redisClient.get(`customer:${customerId}:loyalty`);
      if (cachedLoyalty) {
        return JSON.parse(cachedLoyalty);
      }
    }

    // Get customer loyalty record
    const customerLoyalty = await CustomerLoyalty.findOne({ customer: customerId })
      .populate('customer', 'firstName lastName customerNumber')
      .populate('events.transaction', 'saleNumber saleDate total');

    if (!customerLoyalty) {
      // Create a default loyalty record if none exists
      return {
        customer: customerId,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        expiredPoints: 0,
        tier: 'Standard',
        events: [],
      };
    }

    // Get active loyalty program for points valuation
    const loyaltyProgram = await LoyaltyProgram.findOne({ isActive: true });
    
    // Get customer's tier details
    const tierDetails = await LoyaltyTier.findOne({ 
      name: customerLoyalty.tier,
      isActive: true 
    });

    const result = {
      ...customerLoyalty.toObject(),
      pointsValue: loyaltyProgram 
        ? customerLoyalty.availablePoints * loyaltyProgram.pointsValuation
        : 0,
      tierDetails: tierDetails ? {
        name: tierDetails.name,
        description: tierDetails.description,
        pointsMultiplier: tierDetails.pointsMultiplier,
        benefits: tierDetails.benefits,
      } : null,
    };

    // Cache the result
    if (redisClient.isOpen) {
      await redisClient.setEx(
        `customer:${customerId}:loyalty`,
        300, // Cache for 5 minutes
        JSON.stringify(result)
      );
    }

    return result;
  } catch (error) {
    logger.error('Error in getCustomerLoyalty:', error);
    throw error;
  }
};

/**
 * Process expired points
 * This should be run as a scheduled job
 */
export const processExpiredPoints = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const today = new Date();
    
    // Find all customer loyalty records with events that have expired
    const customerLoyalties = await CustomerLoyalty.find({
      'events.expiryDate': { $lt: today },
      'events.eventType': LoyaltyEventType.PURCHASE, // Only purchase events expire
    }).session(session);

    let totalProcessed = 0;
    let totalExpired = 0;

    // Process each customer
    for (const loyalty of customerLoyalties) {
      let pointsExpired = 0;
      
      // Find expired events that haven't been processed yet
      const expiredEvents = loyalty.events.filter(
        event => 
          event.eventType === LoyaltyEventType.PURCHASE && 
          event.expiryDate && 
          event.expiryDate < today &&
          event.points > 0 // Only positive points can expire
      );
      
      // Process each expired event
      for (const event of expiredEvents) {
        // Add expiry event
        loyalty.events.push({
          eventType: LoyaltyEventType.EXPIRY,
          points: -event.points, // Negative points for expiry
          description: `Points expired from event on ${event.createdAt?.toLocaleDateString()}`,
          createdBy: loyalty.customer, // System update
        });
        
        pointsExpired += event.points;
        
        // Mark original event as processed by setting points to 0
        // This is a workaround since we can't modify the original event directly
        // in the array without complex array manipulation
        event.points = 0;
      }
      
      if (pointsExpired > 0) {
        // Update points
        loyalty.availablePoints = Math.max(0, loyalty.availablePoints - pointsExpired);
        loyalty.expiredPoints += pointsExpired;
        
        // Save changes
        await loyalty.save({ session });
        
        // Clear cache
        if (redisClient.isOpen) {
          await redisClient.del(`customer:${loyalty.customer}:loyalty`);
        }
        
        totalProcessed++;
        totalExpired += pointsExpired;
      }
    }

    await session.commitTransaction();
    
    return {
      processed: totalProcessed,
      expiredPoints: totalExpired,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in processExpiredPoints:', error);
    throw error;
  } finally {
    session.endSession();
  }
};
