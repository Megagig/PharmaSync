import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  medication: mongoose.Types.ObjectId;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  location: string;
  supplier?: mongoose.Types.ObjectId;
  purchaseDate?: Date;
  purchasePrice?: number;
  sellingPrice?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventoryItem>(
  {
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
inventorySchema.index({ medication: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ quantity: 1 });
inventorySchema.index({ supplier: 1 });

const Inventory = mongoose.model<IInventoryItem>('Inventory', inventorySchema);

export default Inventory;
