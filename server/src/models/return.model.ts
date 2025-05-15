import mongoose, { Schema } from 'mongoose';
import {
  IReturn,
  ReturnStatus,
  RefundStatus,
} from '../interfaces/return.interface';
import { generateRandomString } from '../utils/helpers';

const returnItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['good', 'damaged', 'expired'],
      required: true,
    },
    returnToStock: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const returnSchema = new Schema<IReturn>(
  {
    returnNumber: {
      type: String,
      required: true,
      trim: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(ReturnStatus),
      default: ReturnStatus.PENDING,
    },
    items: [returnItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    refundStatus: {
      type: String,
      enum: Object.values(RefundStatus),
      default: RefundStatus.PENDING,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'credit', 'store_credit'],
    },
    refundReference: {
      type: String,
      trim: true,
    },
    refundDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
returnSchema.index({ returnNumber: 1 });
returnSchema.index({ sale: 1 });
returnSchema.index({ customer: 1 });
returnSchema.index({ returnDate: 1 });
returnSchema.index({ status: 1 });
returnSchema.index({ refundStatus: 1 });
returnSchema.index({ createdBy: 1 });

// Generate return number before saving
returnSchema.pre('save', async function (next) {
  if (!this.returnNumber) {
    // Format: RET-YYYYMMDD-XXXX (e.g., RET-20230615-1234)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = generateRandomString(4);
    this.returnNumber = `RET-${dateStr}-${randomStr}`;
  }
  next();
});

const Return = mongoose.model<IReturn>('Return', returnSchema);

export default Return;
