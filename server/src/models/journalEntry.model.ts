import mongoose, { Schema } from 'mongoose';
import {
  IJournalEntry,
  IJournalEntryItem,
  JournalEntryStatus,
  JournalEntryType,
} from '../interfaces/accounting.interface';
import { generateRandomString } from '../utils/helpers';

const journalEntryItemSchema = new Schema<IJournalEntryItem>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    description: {
      type: String,
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
  },
  { _id: true }
);

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    entryNumber: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(JournalEntryStatus),
      default: JournalEntryStatus.DRAFT,
    },
    type: {
      type: String,
      enum: Object.values(JournalEntryType),
      default: JournalEntryType.MANUAL,
    },
    items: [journalEntryItemSchema],
    totalDebit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalCredit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    },
    recurringEndDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['sale', 'purchase', 'expense', 'payment', 'invoice', 'other'],
      },
      entityId: {
        type: Schema.Types.ObjectId,
      },
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
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    postedAt: {
      type: Date,
    },
    reversedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reversedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
journalEntrySchema.index({ entryNumber: 1 }, { unique: true });
journalEntrySchema.index({ date: 1 });
journalEntrySchema.index({ status: 1 });
journalEntrySchema.index({ type: 1 });
journalEntrySchema.index({
  'relatedEntity.entityType': 1,
  'relatedEntity.entityId': 1,
});
journalEntrySchema.index({ createdBy: 1 });

// Generate entry number before saving
journalEntrySchema.pre('save', function (next) {
  if (!this.entryNumber) {
    // Format: JE-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.entryNumber = `JE-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Calculate totals
  if (this.isModified('items') || this.isNew) {
    this.totalDebit = this.items.reduce((sum, item) => sum + item.debit, 0);
    this.totalCredit = this.items.reduce((sum, item) => sum + item.credit, 0);
  }

  next();
});

const JournalEntry = mongoose.model<IJournalEntry>(
  'JournalEntry',
  journalEntrySchema
);

export default JournalEntry;
