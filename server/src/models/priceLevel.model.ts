import mongoose, { Schema } from 'mongoose';
import { IPriceLevel } from '../interfaces/priceLevel.interface';

const priceLevelSchema = new Schema<IPriceLevel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
    },
    code: {
      type: String,
      required: true,
      trim: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
    },
    description: {
      type: String,
      trim: true,
    },
    markupPercentage: {
      type: Number,
      min: 0,
      max: 1000,
    },
    markdownPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
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
priceLevelSchema.index({ name: 1 });
priceLevelSchema.index({ code: 1 });
priceLevelSchema.index({ isDefault: 1 });
priceLevelSchema.index({ isActive: 1 });

// Generate code before saving if not provided
priceLevelSchema.pre('save', function (next) {
  if (!this.code) {
    // Format: PL-XXX (where XXX is derived from the name)
    const namePrefix = this.name.substring(0, 3).toUpperCase();
    this.code = `PL-${namePrefix}`;
  }
  next();
});

// Ensure only one default price level
priceLevelSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Cast this.constructor to any to avoid TypeScript error
    const PriceLevelModel = this.constructor as any;
    await PriceLevelModel.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const PriceLevel = mongoose.model<IPriceLevel>('PriceLevel', priceLevelSchema);

export default PriceLevel;
