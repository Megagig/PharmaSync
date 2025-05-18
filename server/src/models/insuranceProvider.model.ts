import mongoose, { Schema } from 'mongoose';
import { IInsuranceProvider, InsuranceProviderStatus } from '../interfaces/insurance.interface';

const InsuranceProviderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Insurance provider name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Insurance provider code is required'],
      trim: true,
      unique: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'USA',
    },
    website: {
      type: String,
      trim: true,
    },
    apiEndpoint: {
      type: String,
      trim: true,
    },
    apiKey: {
      type: String,
      trim: true,
    },
    apiSecret: {
      type: String,
      trim: true,
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

// Virtual for plans
InsuranceProviderSchema.virtual('plans', {
  ref: 'InsurancePlan',
  localField: '_id',
  foreignField: 'provider',
});

// Index for faster lookups
InsuranceProviderSchema.index({ name: 1 });
InsuranceProviderSchema.index({ code: 1 });
InsuranceProviderSchema.index({ status: 1 });

const InsuranceProvider = mongoose.model<IInsuranceProvider>(
  'InsuranceProvider',
  InsuranceProviderSchema
);

export default InsuranceProvider;
