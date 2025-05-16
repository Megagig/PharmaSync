import mongoose, { Schema } from 'mongoose';
import { ITimeOffRequest } from '../interfaces/schedule.interface';

const timeOffRequestSchema = new Schema<ITimeOffRequest>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
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
      type: String,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
// timeOffRequestSchema.index({ user: 1 }); // Removed to avoid duplicate index
timeOffRequestSchema.index({ startDate: 1, endDate: 1 });
timeOffRequestSchema.index({ status: 1 });

// Validate that end date is after start date
timeOffRequestSchema.pre('validate', function (next) {
  const request = this as any;
  if (request.startDate >= request.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

const TimeOffRequest = mongoose.model<ITimeOffRequest>(
  'TimeOffRequest',
  timeOffRequestSchema
);

export default TimeOffRequest;
