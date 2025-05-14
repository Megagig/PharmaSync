import mongoose, { Schema } from 'mongoose';
import {
  IScheduleShift,
  ShiftType,
  RecurrenceType,
} from '../interfaces/schedule.interface';

const scheduleShiftSchema = new Schema<IScheduleShift>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    shiftType: {
      type: String,
      enum: Object.values(ShiftType),
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceType: {
      type: String,
      enum: Object.values(RecurrenceType),
      default: RecurrenceType.NONE,
    },
    recurrenceEndDate: {
      type: Date,
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: String,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
scheduleShiftSchema.index({ user: 1 });
scheduleShiftSchema.index({ startTime: 1, endTime: 1 });
scheduleShiftSchema.index({ shiftType: 1 });

// Validate that end time is after start time
scheduleShiftSchema.pre('validate', function (next) {
  const shift = this as any;
  if (shift.startTime >= shift.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

const ScheduleShift = mongoose.model<IScheduleShift>(
  'ScheduleShift',
  scheduleShiftSchema
);

export default ScheduleShift;
