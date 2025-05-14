import mongoose, { Schema } from 'mongoose';
import { ITimeOffRequest } from '../interfaces/schedule.interface';

const timeOffRequestSchema = new Schema<ITimeOffRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
timeOffRequestSchema.index({ user: 1 });
timeOffRequestSchema.index({ startDate: 1, endDate: 1 });
timeOffRequestSchema.index({ status: 1 });

// Validate that end date is after start date
timeOffRequestSchema.pre('validate', function (next) {
  if (this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

const TimeOffRequest = mongoose.model<ITimeOffRequest>('TimeOffRequest', timeOffRequestSchema);

export default TimeOffRequest;
