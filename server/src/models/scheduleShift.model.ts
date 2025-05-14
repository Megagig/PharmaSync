import mongoose, { Schema } from 'mongoose';
import { IScheduleShift, ShiftType, RecurrenceType } from '../interfaces/schedule.interface';

const scheduleShiftSchema = new Schema<IScheduleShift>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
scheduleShiftSchema.index({ user: 1 });
scheduleShiftSchema.index({ startTime: 1, endTime: 1 });
scheduleShiftSchema.index({ shiftType: 1 });

// Validate that end time is after start time
scheduleShiftSchema.pre('validate', function (next) {
  if (this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

const ScheduleShift = mongoose.model<IScheduleShift>('ScheduleShift', scheduleShiftSchema);

export default ScheduleShift;
