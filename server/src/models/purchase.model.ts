import mongoose, { Schema } from 'mongoose';
import { IPurchase, PurchaseStatus } from '../interfaces/purchase.interface';
import { generateRandomString } from '../utils/helpers';

const purchaseItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    retailPrice: {
      type: Number,
      min: 0,
    },
    wholesalePrice: {
      type: Number,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    purchaseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.COMPLETED,
    },
    items: [purchaseItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: ['prepaid', 'net15', 'net30', 'net60', 'cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
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
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ purchaseDate: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentStatus: 1 });

// Generate purchase number before saving
purchaseSchema.pre('save', function (next) {
  if (!this.purchaseNumber) {
    // Format: PUR-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.purchaseNumber = `PUR-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate total
    this.total = this.subtotal - this.discount + this.tax + this.shippingCost;
  }

  next();
});

const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
