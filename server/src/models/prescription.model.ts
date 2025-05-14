import mongoose, { Schema } from 'mongoose';
import {
  IPrescription,
  PrescriptionStatus,
} from '../interfaces/prescription.interface';
import { generateRandomString } from '../utils/helpers';

const prescriptionItemSchema = new Schema(
  {
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    dosage: {
      amount: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
      frequency: {
        type: String,
        required: true,
      },
      route: {
        type: String,
        required: true,
      },
      instructions: {
        type: String,
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    refills: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    refillsRemaining: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const dispensingSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
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
    dispensedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const prescriptionSchema = new Schema<IPrescription>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    prescriber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescriptionNumber: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
    },
    prescriptionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PrescriptionStatus),
      default: PrescriptionStatus.PENDING,
    },
    items: [prescriptionItemSchema],
    dispensingHistory: [dispensingSchema],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ expiryDate: 1 });

// Generate prescription number before saving
prescriptionSchema.pre('save', function (next) {
  if (!this.prescriptionNumber) {
    // Format: RX-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.prescriptionNumber = `RX-${dateStr}-${generateRandomString(
      5
    ).toUpperCase()}`;
  }

  // Set refillsRemaining to refills for new items
  this.items.forEach((item) => {
    if (item.isNew) {
      item.refillsRemaining = item.refills;
    }
  });

  next();
});

const Prescription = mongoose.model<IPrescription>(
  'Prescription',
  prescriptionSchema
);

export default Prescription;
