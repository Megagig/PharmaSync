import mongoose, { Schema } from 'mongoose';
import {
  IDispensing,
  DispensingStatus,
} from '../interfaces/dispensing.interface';
import { generateRandomString } from '../utils/helpers';

const dispensingItemSchema = new Schema(
  {
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    prescriptionItem: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription.items',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const dispensingSchema = new Schema<IDispensing>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    dispensedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dispensingNumber: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
    },
    dispensingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(DispensingStatus),
      default: DispensingStatus.COMPLETED,
    },
    items: [dispensingItemSchema],
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'credit', 'other'],
      default: 'cash',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
    },
    receiptGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
dispensingSchema.index({ patient: 1 });
dispensingSchema.index({ prescription: 1 });
dispensingSchema.index({ dispensingNumber: 1 });
dispensingSchema.index({ dispensingDate: 1 });
dispensingSchema.index({ status: 1 });

// Generate dispensing number before saving
dispensingSchema.pre('save', function (next) {
  if (!this.dispensingNumber) {
    // Format: DISP-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.dispensingNumber = `DISP-${dateStr}-${generateRandomString(
      5
    ).toUpperCase()}`;
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate total
    this.total = this.subtotal - this.discount + this.tax;
  }

  next();
});

const Dispensing = mongoose.model<IDispensing>('Dispensing', dispensingSchema);

export default Dispensing;
