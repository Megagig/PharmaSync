import mongoose, { Schema } from 'mongoose';
import {
  IBudget,
  BudgetPeriod,
  BudgetStatus,
} from '../interfaces/budget.interface';
import { ExpenseCategory } from '../interfaces/expense.interface';
import { generateRandomString } from '../utils/helpers';

const budgetItemSchema = new Schema(
  {
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    amount: {
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

const budgetActualSchema = new Schema(
  {
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    variance: {
      type: Number,
      required: true,
      default: 0,
    },
    variancePercentage: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true }
);

const budgetSchema = new Schema<IBudget>(
  {
    budgetNumber: {
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
    period: {
      type: String,
      enum: Object.values(BudgetPeriod),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BudgetStatus),
      default: BudgetStatus.DRAFT,
    },
    totalBudget: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalActual: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalVariance: {
      type: Number,
      required: true,
      default: 0,
    },
    items: [budgetItemSchema],
    actuals: [budgetActualSchema],
    notes: {
      type: String,
      trim: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
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
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
budgetSchema.index({ budgetNumber: 1 });
budgetSchema.index({ title: 1 });
budgetSchema.index({ period: 1 });
budgetSchema.index({ startDate: 1 });
budgetSchema.index({ endDate: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ location: 1 });
budgetSchema.index({ createdBy: 1 });

// Generate budget number before saving
budgetSchema.pre('save', function (next) {
  if (!this.budgetNumber) {
    // Format: BUD-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.budgetNumber = `BUD-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Calculate total budget
  if (this.isModified('items') || this.isNew) {
    this.totalBudget = this.items.reduce((sum, item) => sum + item.amount, 0);
  }

  next();
});

const Budget = mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget;
