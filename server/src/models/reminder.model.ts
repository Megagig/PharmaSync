import mongoose, { Schema } from 'mongoose';
import { IReminder, ReminderStatus, ReminderType } from '../interfaces/reminder.interface';

const reminderSchema = new Schema<IReminder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ReminderType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ReminderStatus),
      default: ReminderStatus.PENDING,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    sentDate: {
      type: Date,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
reminderSchema.index({ customer: 1 });
reminderSchema.index({ type: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ scheduledDate: 1 });
reminderSchema.index({ invoice: 1 });
reminderSchema.index({ payment: 1 });
reminderSchema.index({ createdBy: 1 });

const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);

export default Reminder;
