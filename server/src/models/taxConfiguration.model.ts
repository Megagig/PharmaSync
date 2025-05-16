import mongoose, { Schema } from 'mongoose';
import { ITaxConfiguration, TaxType } from '../interfaces/accounting.interface';

const taxConfigurationSchema = new Schema<ITaxConfiguration>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(TaxType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
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
taxConfigurationSchema.index({ name: 1 });
taxConfigurationSchema.index({ type: 1 });
taxConfigurationSchema.index({ isActive: 1 });
taxConfigurationSchema.index({ isDefault: 1 });

const TaxConfiguration = mongoose.model<ITaxConfiguration>(
  'TaxConfiguration',
  taxConfigurationSchema
);

export default TaxConfiguration;
