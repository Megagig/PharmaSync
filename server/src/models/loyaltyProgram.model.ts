import mongoose, { Schema } from 'mongoose';
import { ILoyaltyProgram } from '../interfaces/loyalty.interface';

const loyaltyProgramSchema = new Schema<ILoyaltyProgram>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pointsPerCurrency: {
      type: Number,
      required: true,
      min: 0,
      default: 1, // 1 point per currency unit
    },
    minimumPurchase: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // No minimum purchase required
    },
    pointsValuation: {
      type: Number,
      required: true,
      min: 0,
      default: 0.01, // 1 point = 0.01 currency units
    },
    expiryPeriod: {
      type: Number,
      required: true,
      min: 0,
      default: 365, // Points expire after 1 year
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
loyaltyProgramSchema.index({ isActive: 1 });

const LoyaltyProgram = mongoose.model<ILoyaltyProgram>('LoyaltyProgram', loyaltyProgramSchema);

export default LoyaltyProgram;
