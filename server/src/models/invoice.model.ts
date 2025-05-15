import mongoose, { Schema } from 'mongoose';
import {
  IInvoice,
  InvoiceStatus,
  InvoiceType,
} from '../interfaces/invoice.interface';
import { generateRandomString } from '../utils/helpers';

const invoiceItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unitPrice: {
      type: Number,
      required: true,
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    type: {
      type: String,
      enum: Object.values(InvoiceType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
    },
    items: [invoiceItemSchema],
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
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    termsAndConditions: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ invoiceDate: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ supplier: 1 });
invoiceSchema.index({ type: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ sale: 1 });
invoiceSchema.index({ purchaseOrder: 1 });

// Generate invoice number before saving
invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    // Format: INV-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = this.type === InvoiceType.SALES ? 'INV' : 'PINV';
    this.invoiceNumber = `${prefix}-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate total
    this.total = this.subtotal - this.discount + this.tax;

    // Calculate balance
    this.balance = this.total - this.amountPaid;

    // Update status based on payment
    if (this.balance <= 0) {
      this.status = InvoiceStatus.PAID;
    } else if (this.amountPaid > 0) {
      this.status = InvoiceStatus.PARTIAL;
    }
  }

  next();
});

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;
