import mongoose, { Schema } from 'mongoose';
import { ICreditTransaction, CreditTransactionType } from '../interfaces/credit.interface';

const creditTransactionSchema = new Schema<ICreditTransaction>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(CreditTransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
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
creditTransactionSchema.index({ customer: 1 });
creditTransactionSchema.index({ transactionType: 1 });
creditTransactionSchema.index({ sale: 1 });
creditTransactionSchema.index({ payment: 1 });
creditTransactionSchema.index({ invoice: 1 });
creditTransactionSchema.index({ createdAt: 1 });

const CreditTransaction = mongoose.model<ICreditTransaction>('CreditTransaction', creditTransactionSchema);

export default CreditTransaction;
