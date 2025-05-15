import mongoose, { Schema } from 'mongoose';
import {
  IPayment,
  PaymentMethod,
  PaymentDirection,
} from '../interfaces/payment.interface';
import { generateRandomString } from '../utils/helpers';

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    direction: {
      type: String,
      enum: Object.values(PaymentDirection),
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
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
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ direction: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ supplier: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ sale: 1 });
paymentSchema.index({ purchaseOrder: 1 });

// Generate payment number before saving
paymentSchema.pre('save', function (next) {
  if (!this.paymentNumber) {
    // Format: PAY-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = this.direction === PaymentDirection.RECEIVED ? 'RCPT' : 'PYMT';
    this.paymentNumber = `${prefix}-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  next();
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
