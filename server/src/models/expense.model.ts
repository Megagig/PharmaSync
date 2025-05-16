import mongoose, { Schema } from 'mongoose';
import {
  IExpense,
  ExpenseCategory,
  ExpenseStatus,
  PaymentMethod,
  RecurrenceInterval,
} from '../interfaces/expense.interface';
import { generateRandomString } from '../utils/helpers';

const expenseAttachmentSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const expenseSchema = new Schema<IExpense>(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    paymentDate: {
      type: Date,
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
    },
    attachments: [expenseAttachmentSchema],
    notes: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceInterval: {
      type: String,
      enum: Object.values(RecurrenceInterval),
      default: RecurrenceInterval.NONE,
    },
    recurrenceEndDate: {
      type: Date,
    },
    parentExpense: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
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
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
expenseSchema.index({ expenseNumber: 1 });
expenseSchema.index({ title: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: 1 });
expenseSchema.index({ dueDate: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ supplier: 1 });
expenseSchema.index({ location: 1 });
expenseSchema.index({ isRecurring: 1 });
expenseSchema.index({ parentExpense: 1 });
expenseSchema.index({ createdBy: 1 });

// Generate expense number before saving
expenseSchema.pre('save', function (next) {
  if (!this.expenseNumber) {
    // Format: EXP-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.expenseNumber = `EXP-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  next();
});

const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
