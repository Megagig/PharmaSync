import mongoose, { Schema } from 'mongoose';
import { IPosTransaction, PosTransactionType } from '../interfaces/posTransaction.interface';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { generateRandomString } from '../utils/helpers';

const posPaymentMethodSchema = new Schema(
  {
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'credit', 'gift_card', 'store_credit', 'mobile_money'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
      trim: true,
    },
    cardType: {
      type: String,
      trim: true,
    },
    cardLast4: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const posTransactionSchema = new Schema<IPosTransaction>(
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
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
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
        subtotal: {
          type: Number,
          required: true,
          min: 0,
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
    ],
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
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PAID,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'credit', 'gift_card', 'store_credit', 'mobile_money', 'multiple'],
      default: 'multiple',
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
      default: true,
    },
    // POS specific fields
    transactionType: {
      type: String,
      enum: Object.values(PosTransactionType),
      required: true,
    },
    posSession: {
      type: Schema.Types.ObjectId,
      ref: 'PosSession',
      required: true,
    },
    register: {
      type: String,
      required: true,
      trim: true,
    },
    cashier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethods: [posPaymentMethodSchema],
    changeDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnReason: {
      type: String,
      enum: [
        'damaged',
        'expired',
        'wrong_item',
        'customer_dissatisfied',
        'adverse_reaction',
        'prescription_change',
        'other',
      ],
      trim: true,
    },
    returnReasonDetails: {
      type: String,
      trim: true,
    },
    originalSale: {
      type: Schema.Types.ObjectId,
      ref: 'PosTransaction',
    },
    returnedItems: [{
      type: Schema.Types.ObjectId,
      ref: 'SaleItem',
    }],
    giftCardIssued: {
      type: Boolean,
      default: false,
    },
    giftCardAmount: {
      type: Number,
      min: 0,
    },
    giftCardNumber: {
      type: String,
      trim: true,
    },
    storeCreditIssued: {
      type: Boolean,
      default: false,
    },
    storeCreditAmount: {
      type: Number,
      min: 0,
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Customer', // Assuming doctors are stored as customers with type HEALTHCARE_PROFESSIONAL
    },
    barcodeScanned: {
      type: Boolean,
      default: false,
    },
    loyaltyPointsEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      min: 0,
      default: 0,
    },
    emailReceipt: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    refillReminder: {
      type: Boolean,
      default: false,
    },
    refillReminderDate: {
      type: Date,
    },
    // We already have loyaltyPointsEarned and loyaltyPointsRedeemed fields above
    loyaltyPointsReturned: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Loyalty discount is included in the total discount
    // No separate field needed
    returnPolicy: {
      type: String,
      trim: true,
    },
    returnPeriod: {
      type: Number,
      min: 0,
    },
    returnDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
posTransactionSchema.index({ saleNumber: 1 });
posTransactionSchema.index({ saleDate: 1 });
posTransactionSchema.index({ status: 1 });
posTransactionSchema.index({ paymentStatus: 1 });
posTransactionSchema.index({ location: 1 });
posTransactionSchema.index({ posSession: 1 });
posTransactionSchema.index({ transactionType: 1 });
posTransactionSchema.index({ cashier: 1 });
posTransactionSchema.index({ prescription: 1 });
posTransactionSchema.index({ doctor: 1 });
posTransactionSchema.index({ 'items.product': 1 });
posTransactionSchema.index({ emailSent: 1 });
posTransactionSchema.index({ refillReminder: 1, refillReminderDate: 1 });

// Generate sale number before saving
posTransactionSchema.pre('save', function (next) {
  const doc = this as any; // Use 'any' type to bypass TypeScript checks

  if (!doc.saleNumber) {
    // Format: POS-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    let prefix;
    switch (doc.transactionType) {
      case PosTransactionType.SALE:
        prefix = 'POS';
        break;
      case PosTransactionType.RETURN:
        prefix = 'RET';
        break;
      case PosTransactionType.EXCHANGE:
        prefix = 'EXC';
        break;
      case PosTransactionType.VOID:
        prefix = 'VOID';
        break;
      case PosTransactionType.REFUND:
        prefix = 'REF';
        break;
      case PosTransactionType.PARTIAL_RETURN:
        prefix = 'PRET';
        break;
      default:
        prefix = 'POS';
    }
    doc.saleNumber = `${prefix}-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Calculate totals
  if (doc.isModified('items') || doc.isNew) {
    // Calculate subtotal
    doc.subtotal = doc.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    // Calculate total
    doc.total = doc.subtotal - doc.discount + doc.tax;
  }

  // Calculate change due
  if (doc.isModified('paymentMethods') || doc.isNew) {
    const totalPaid = doc.paymentMethods.reduce((sum: number, method: any) => sum + method.amount, 0);
    doc.changeDue = Math.max(0, totalPaid - doc.total);
  }

  next();
});

const PosTransaction = mongoose.model<IPosTransaction>('PosTransaction', posTransactionSchema);

export default PosTransaction;
