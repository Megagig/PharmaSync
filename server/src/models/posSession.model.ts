import mongoose, { Schema } from 'mongoose';
import { IPosSession, PosSessionStatus } from '../interfaces/posSession.interface';
import { generateRandomString } from '../utils/helpers';

const posSessionSchema = new Schema<IPosSession>(
  {
    sessionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    openedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    openingTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closingTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(PosSessionStatus),
      default: PosSessionStatus.OPEN,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    register: {
      type: String,
      required: true,
      trim: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedClosingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    actualClosingBalance: {
      type: Number,
      min: 0,
    },
    cashVariance: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sale',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
posSessionSchema.index({ sessionNumber: 1 });
posSessionSchema.index({ openingTime: 1 });
posSessionSchema.index({ status: 1 });
posSessionSchema.index({ location: 1 });
posSessionSchema.index({ openedBy: 1 });

// Generate session number before saving
posSessionSchema.pre('save', function (next) {
  if (!this.sessionNumber) {
    // Format: POS-YYYYMMDD-XXXXX (where XXXXX is a random alphanumeric string)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.sessionNumber = `POS-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  }

  // Set expected closing balance initially to opening balance
  if (this.isNew) {
    this.expectedClosingBalance = this.openingBalance;
  }

  // Calculate cash variance when closing
  if (this.isModified('actualClosingBalance') && this.actualClosingBalance !== undefined) {
    this.cashVariance = this.actualClosingBalance - this.expectedClosingBalance;
  }

  next();
});

const PosSession = mongoose.model<IPosSession>('PosSession', posSessionSchema);

export default PosSession;
