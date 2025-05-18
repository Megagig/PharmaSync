import mongoose, { Schema } from 'mongoose';
import { IInsuranceEligibilityCheck } from '../interfaces/insurance.interface';

const InsuranceEligibilityCheckSchema: Schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    customerInsurance: {
      type: Schema.Types.ObjectId,
      ref: 'CustomerInsurance',
      required: [true, 'Customer insurance is required'],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceProvider',
      required: [true, 'Insurance provider is required'],
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'InsurancePlan',
      required: [true, 'Insurance plan is required'],
    },
    checkDate: {
      type: Date,
      required: [true, 'Check date is required'],
      default: Date.now,
    },
    isEligible: {
      type: Boolean,
      required: [true, 'Eligibility status is required'],
    },
    coverageDetails: {
      prescription: {
        coveragePercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        deductible: {
          type: Number,
          min: 0,
        },
        deductibleMet: {
          type: Boolean,
          default: false,
        },
        annualLimit: {
          type: Number,
          min: 0,
        },
        usedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      otc: {
        coveragePercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        deductible: {
          type: Number,
          min: 0,
        },
        deductibleMet: {
          type: Boolean,
          default: false,
        },
        annualLimit: {
          type: Number,
          min: 0,
        },
        usedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    },
    responseDetails: {
      type: Schema.Types.Mixed,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster lookups
InsuranceEligibilityCheckSchema.index({ customer: 1, checkDate: -1 });
InsuranceEligibilityCheckSchema.index({ customerInsurance: 1, checkDate: -1 });
InsuranceEligibilityCheckSchema.index({ provider: 1 });
InsuranceEligibilityCheckSchema.index({ isEligible: 1 });

const InsuranceEligibilityCheck = mongoose.model<IInsuranceEligibilityCheck>(
  'InsuranceEligibilityCheck',
  InsuranceEligibilityCheckSchema
);

export default InsuranceEligibilityCheck;
