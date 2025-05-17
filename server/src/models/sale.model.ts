import mongoose, { Schema } from 'mongoose';
import { ISale, SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { generateRandomString } from '../utils/helpers';

const saleItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    finalPrice: {
      type: Number,
      required: true,
      min: [0, 'Final price cannot be negative'],
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
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

const saleSchema = new Schema<ISale>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    saleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.COMPLETED,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: function (items: any[]) {
          return items.length > 0;
        },
        message: 'Sale must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    totalDiscount: {
      type: Number,
      required: true,
      min: [0, 'Total discount cannot be negative'],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0,
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PAID,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'transfer', 'credit', 'multiple'],
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
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    receiptGenerated: {
      type: Boolean,
      default: false,
    },
    voidedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    voidedAt: Date,
    voidReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for faster queries
saleSchema.index({ customer: 1 });
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ saleDate: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ location: 1 });
saleSchema.index({ createdBy: 1 });

// Virtuals
saleSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

saleSchema.virtual('averageItemPrice').get(function () {
  if (this.items.length === 0) return 0;
  return this.total / this.items.length;
});

// Generate sale number before saving
saleSchema.pre('save', function (next) {
  if (!this.saleNumber) {
    // Format: SALE-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.saleNumber = `SALE-${dateStr}-${generateRandomString(
      5
    ).toUpperCase()}`;
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate total
    this.total = this.subtotal - this.totalDiscount;
  }

  next();
});

const Sale = mongoose.model<ISale>('Sale', saleSchema);

export default Sale;
