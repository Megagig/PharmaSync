import mongoose, { Schema } from 'mongoose';
import {
  IInventoryMovement,
  MovementType,
} from '../interfaces/inventoryMovement.interface';
import { generateRandomString } from '../utils/helpers';

const movementItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MovementType),
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sourceLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    destinationLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: function (this: IInventoryMovement) {
        return this.type === MovementType.TRANSFER;
      },
    },
    items: [movementItemSchema],
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
inventoryMovementSchema.index({ referenceNumber: 1 });
inventoryMovementSchema.index({ type: 1 });
inventoryMovementSchema.index({ date: 1 });
inventoryMovementSchema.index({ sourceLocation: 1 });
inventoryMovementSchema.index({ destinationLocation: 1 });
inventoryMovementSchema.index({ status: 1 });
inventoryMovementSchema.index({ 'items.product': 1 });

// Generate reference number before saving if not provided
inventoryMovementSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    // Format: MOV-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const typePrefix = this.type.substring(0, 1).toUpperCase();
    this.referenceNumber = `${typePrefix}MV-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }
  next();
});

const InventoryMovement = mongoose.model<IInventoryMovement>(
  'InventoryMovement',
  inventoryMovementSchema
);

export default InventoryMovement;
