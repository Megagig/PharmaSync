import mongoose, { Schema } from 'mongoose';
import {
  IMedication,
  MedicationType,
  MedicationCategory,
} from '../interfaces/medication.interface';

const dosageSchema = new Schema(
  {
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
  { _id: false }
);

const sideEffectSchema = new Schema(
  {
    effect: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['rare', 'uncommon', 'common', 'very_common'],
      required: true,
    },
  },
  { _id: true }
);

const interactionSchema = new Schema(
  {
    interactsWith: {
      type: String,
      required: true,
    },
    effect: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'contraindicated'],
      required: true,
    },
  },
  { _id: true }
);

const inventoryItemSchema = new Schema(
  {
    batchNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: true }
);

const medicationSchema = new Schema<IMedication>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    genericName: {
      type: String,
      required: true,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: Object.values(MedicationType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    category: {
      type: String,
      enum: Object.values(MedicationCategory),
      required: true,
    },
    dosageForm: {
      type: String,
      required: true,
    },
    strength: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    nafdacNumber: {
      type: String,
    },
    requiresPrescription: {
      type: Boolean,
      required: true,
      default: true,
    },
    standardDosage: {
      type: dosageSchema,
      required: true,
    },
    sideEffects: [sideEffectSchema],
    interactions: [interactionSchema],
    contraindications: [String],
    storageConditions: {
      type: String,
    },
    inventory: [inventoryItemSchema],
    minimumStockLevel: {
      type: Number,
      required: true,
      default: 10,
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
medicationSchema.index({ name: 1 });
medicationSchema.index({ genericName: 1 });
medicationSchema.index({ brandName: 1 });
medicationSchema.index({ category: 1 });
medicationSchema.index({ 'inventory.expiryDate': 1 });

// Virtual for total stock
medicationSchema.virtual('totalStock').get(function (this: IMedication) {
  return this.inventory.reduce((total, item) => total + item.quantity, 0);
});

const Medication = mongoose.model<IMedication>('Medication', medicationSchema);

export default Medication;
