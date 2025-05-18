import mongoose, { Schema } from 'mongoose';
import { ILoyaltyTier } from '../interfaces/loyalty.interface';

const loyaltyTierSchema = new Schema<ILoyaltyTier>(
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
    minimumPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    pointsMultiplier: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    benefits: [{
      type: String,
      trim: true,
    }],
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
loyaltyTierSchema.index({ name: 1 }, { unique: true });
loyaltyTierSchema.index({ minimumPoints: 1 });
loyaltyTierSchema.index({ isActive: 1 });

const LoyaltyTier = mongoose.model<ILoyaltyTier>('LoyaltyTier', loyaltyTierSchema);

export default LoyaltyTier;
