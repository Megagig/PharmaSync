import { Document, Types } from 'mongoose';

export enum LoyaltyEventType {
  PURCHASE = 'purchase',
  REFUND = 'refund',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  REDEMPTION = 'redemption',
  EXPIRY = 'expiry',
  SIGNUP_BONUS = 'signup_bonus',
  BIRTHDAY_BONUS = 'birthday_bonus',
  REFERRAL = 'referral',
}

export interface ILoyaltyEvent {
  eventType: LoyaltyEventType;
  points: number;
  transaction?: Types.ObjectId;
  description: string;
  expiryDate?: Date;
  createdBy: Types.ObjectId;
  _id?: Types.ObjectId;
}

export interface ILoyaltyProgram extends Document {
  name: string;
  description?: string;
  pointsPerCurrency: number; // e.g., 1 point per $1 spent
  minimumPurchase: number; // Minimum purchase amount to earn points
  pointsValuation: number; // e.g., 0.01 means 1 point = $0.01
  expiryPeriod: number; // Number of days until points expire
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerLoyalty extends Document {
  customer: Types.ObjectId;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  expiredPoints: number;
  tier: string;
  events: Types.DocumentArray<ILoyaltyEvent>;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyTier extends Document {
  name: string;
  description?: string;
  minimumPoints: number;
  pointsMultiplier: number; // e.g., 1.5 means 50% more points
  benefits: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyPromotion extends Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  pointsMultiplier: number;
  minimumPurchase?: number;
  applicableProducts?: Types.ObjectId[];
  applicableCategories?: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
