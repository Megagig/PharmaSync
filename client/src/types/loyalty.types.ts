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

export interface LoyaltyEvent {
  _id: string;
  eventType: LoyaltyEventType;
  points: number;
  transaction?: string;
  description: string;
  expiryDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerLoyalty {
  _id: string;
  customer: string;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  expiredPoints: number;
  tier: string;
  events: LoyaltyEvent[];
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  pointsValue?: number;
  tierDetails?: {
    name: string;
    description?: string;
    pointsMultiplier: number;
    benefits: string[];
  };
}

export interface LoyaltyProgram {
  _id: string;
  name: string;
  description?: string;
  pointsPerCurrency: number;
  minimumPurchase: number;
  pointsValuation: number;
  expiryPeriod: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTier {
  _id: string;
  name: string;
  description?: string;
  minimumPoints: number;
  pointsMultiplier: number;
  benefits: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
