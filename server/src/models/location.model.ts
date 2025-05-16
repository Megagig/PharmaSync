import mongoose, { Schema } from 'mongoose';
import { ILocation, LocationType } from '../interfaces/location.interface';

const locationAddressSchema = new Schema(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Nigeria',
    },
  },
  { _id: false }
);

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(LocationType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    address: locationAddressSchema,
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    manager: {
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
    notes: {
      type: String,
      trim: true,
    },
    parentLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
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
locationSchema.index({ name: 1 });
locationSchema.index({ code: 1 });
locationSchema.index({ type: 1 });
locationSchema.index({ isActive: 1 });
locationSchema.index({ isDefault: 1 });
locationSchema.index({ parentLocation: 1 });

// Generate location code before saving if not provided
locationSchema.pre('save', function (next) {
  if (!this.code) {
    // Format: LOC-XXXXX (where XXXXX is a sequential number)
    const typePrefix = this.type.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.code = `${typePrefix}-${randomNum}`;
  }
  next();
});

// Ensure only one default location
locationSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Cast this.constructor to any to avoid TypeScript error
    const LocationModel = this.constructor as any;
    await LocationModel.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Location = mongoose.model<ILocation>('Location', locationSchema);

export default Location;
