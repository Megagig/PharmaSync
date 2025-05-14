import mongoose, { Schema } from 'mongoose';
import {
  IReportSchedule,
  ReportFrequency,
  ReportFormat,
} from '../interfaces/report.interface';

const reportScheduleSchema = new Schema<IReportSchedule>(
  {
    report: {
      type: String,
      ref: 'ReportConfiguration',
      required: true,
    },
    frequency: {
      type: String,
      enum: Object.values(ReportFrequency),
      required: true,
    },
    format: {
      type: String,
      enum: Object.values(ReportFormat),
      required: true,
    },
    recipients: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          // Simple email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return v.every((email) => emailRegex.test(email));
        },
        message: (props) => `${props.value} contains invalid email addresses!`,
      },
    },
    nextRunDate: {
      type: Date,
      required: true,
    },
    lastRunDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
reportScheduleSchema.index({ report: 1 });
reportScheduleSchema.index({ createdBy: 1 });
reportScheduleSchema.index({ nextRunDate: 1 });
reportScheduleSchema.index({ isActive: 1 });

const ReportSchedule = mongoose.model<IReportSchedule>(
  'ReportSchedule',
  reportScheduleSchema
);

export default ReportSchedule;
