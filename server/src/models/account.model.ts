import mongoose, { Schema } from 'mongoose';
import {
  IAccount,
  AccountType,
  AccountCategory,
  AccountStatus,
} from '../interfaces/accounting.interface';

const accountSchema = new Schema<IAccount>(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(AccountCategory),
      required: true,
    },
    parentAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
    isSubAccount: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },
    balance: {
      type: Number,
      default: 0,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    isSystemAccount: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
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
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
accountSchema.index({ accountNumber: 1 }, { unique: true });
accountSchema.index({ name: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ category: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ parentAccount: 1 });

// Update current balance when balance changes
accountSchema.pre('save', function (next) {
  if (this.isModified('balance')) {
    this.currentBalance = this.balance;
  }
  next();
});

const Account = mongoose.model<IAccount>('Account', accountSchema);

export default Account;
