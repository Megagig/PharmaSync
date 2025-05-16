import mongoose, { Schema } from 'mongoose';
import { IFinancialPeriod, FinancialPeriodStatus } from '../interfaces/accounting.interface';

const financialPeriodSchema = new Schema<IFinancialPeriod>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FinancialPeriodStatus),
      default: FinancialPeriodStatus.OPEN,
    },
    isFiscalYear: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: {
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
  }
);

// Create indexes for faster queries
financialPeriodSchema.index({ startDate: 1, endDate: 1 });
financialPeriodSchema.index({ status: 1 });
financialPeriodSchema.index({ isFiscalYear: 1 });

// Validate that start date is before end date
financialPeriodSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('startDate', 'Start date must be before end date');
  }
  next();
});

const FinancialPeriod = mongoose.model<IFinancialPeriod>('FinancialPeriod', financialPeriodSchema);

export default FinancialPeriod;
