import mongoose, { Schema } from 'mongoose';
import { IInsurancePlan, InsuranceProviderStatus } from '../interfaces/insurance.interface';

const InsurancePlanSchema: Schema = new Schema(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceProvider',
      required: [true, 'Insurance provider is required'],
    },
    name: {
      type: String,
      required: [true, 'Insurance plan name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Insurance plan code is required'],
      trim: true,
    },
    coveragePercentage: {
      type: Number,
      required: [true, 'Coverage percentage is required'],
      min: 0,
      max: 100,
    },
    deductible: {
      type: Number,
      required: [true, 'Deductible amount is required'],
      min: 0,
    },
    annualLimit: {
      type: Number,
      required: [true, 'Annual limit is required'],
      min: 0,
    },
    formulary: {
      type: [String],
      default: [],
    },
    requiresPreauthorization: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(InsuranceProviderStatus),
      default: InsuranceProviderStatus.ACTIVE,
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
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for provider and code
InsurancePlanSchema.index({ provider: 1, code: 1 }, { unique: true });
InsurancePlanSchema.index({ provider: 1, name: 1 });
InsurancePlanSchema.index({ status: 1 });

const InsurancePlan = mongoose.model<IInsurancePlan>(
  'InsurancePlan',
  InsurancePlanSchema
);

export default InsurancePlan;
