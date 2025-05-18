import mongoose, { Schema } from 'mongoose';
import { ICustomerLoyalty, ILoyaltyEvent, LoyaltyEventType } from '../interfaces/loyalty.interface';

const loyaltyEventSchema = new Schema<ILoyaltyEvent>(
  {
    eventType: {
      type: String,
      enum: Object.values(LoyaltyEventType),
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'PosTransaction',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { 
    timestamps: true,
    _id: true 
  }
);

const customerLoyaltySchema = new Schema<ICustomerLoyalty>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    availablePoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    redeemedPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    expiredPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      default: 'Standard',
      trim: true,
    },
    events: [loyaltyEventSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
customerLoyaltySchema.index({ customer: 1 }, { unique: true });
customerLoyaltySchema.index({ tier: 1 });
customerLoyaltySchema.index({ 'events.eventType': 1 });
customerLoyaltySchema.index({ 'events.expiryDate': 1 });
customerLoyaltySchema.index({ lastActivity: 1 });

const CustomerLoyalty = mongoose.model<ICustomerLoyalty>('CustomerLoyalty', customerLoyaltySchema);

export default CustomerLoyalty;
