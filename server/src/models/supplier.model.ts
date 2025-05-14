import mongoose, { Schema } from 'mongoose';
import { ISupplier } from '../interfaces/supplier.interface';

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
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
    taxId: {
      type: String,
      trim: true,
    },
    paymentTerms: {
      type: String,
      enum: ['prepaid', 'net15', 'net30', 'net60', 'cod'],
      default: 'net30',
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferredSupplier: {
      type: Boolean,
      default: false,
    },
    supplierCode: {
      type: String,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
supplierSchema.index({ name: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ supplierCode: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ preferredSupplier: 1 });

// Generate supplier code before saving if not provided
supplierSchema.pre('save', function (next) {
  if (!this.supplierCode) {
    // Format: SUP-XXXX (where XXXX is a sequential number)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.supplierCode = `SUP-${randomNum}`;
  }
  next();
});

const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;
