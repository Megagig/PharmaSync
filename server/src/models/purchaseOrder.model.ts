import mongoose, { Schema } from 'mongoose';
import {
  IPurchaseOrder,
  PurchaseOrderStatus,
} from '../interfaces/purchaseOrder.interface';
import { generateRandomString } from '../utils/helpers';

const purchaseOrderItemSchema = new Schema(
  {
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    batchNumber: {
      type: String,
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

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(PurchaseOrderStatus),
      default: PurchaseOrderStatus.DRAFT,
    },
    items: [purchaseOrderItemSchema],
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
      default: 'net30',
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
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ orderDate: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ paymentStatus: 1 });

// Generate order number before saving
purchaseOrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Format: PO-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.orderNumber = `PO-${dateStr}-${generateRandomString(5).toUpperCase()}`;
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

const PurchaseOrder = mongoose.model<IPurchaseOrder>(
  'PurchaseOrder',
  purchaseOrderSchema
);

export default PurchaseOrder;
