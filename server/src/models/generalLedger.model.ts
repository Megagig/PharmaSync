import mongoose, { Schema } from 'mongoose';
import { IGeneralLedgerEntry } from '../interfaces/accounting.interface';

const generalLedgerSchema = new Schema<IGeneralLedgerEntry>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    journalEntry: {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    debit: {
      type: Number,
      default: 0,
      min: 0,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
generalLedgerSchema.index({ account: 1, date: 1 });
generalLedgerSchema.index({ journalEntry: 1 });
generalLedgerSchema.index({ date: 1 });

const GeneralLedger = mongoose.model<IGeneralLedgerEntry>('GeneralLedger', generalLedgerSchema);

export default GeneralLedger;
