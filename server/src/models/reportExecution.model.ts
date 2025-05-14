import mongoose, { Schema } from 'mongoose';
import { IReportExecution, ReportFormat } from '../interfaces/report.interface';

const reportExecutionSchema = new Schema<IReportExecution>(
  {
    report: {
      type: String,
      ref: 'ReportConfiguration',
      required: true,
    },
    schedule: {
      type: String,
      ref: 'ReportSchedule',
    },
    format: {
      type: String,
      enum: Object.values(ReportFormat),
      required: true,
    },
    executedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    fileUrl: {
      type: String,
    },
    error: {
      type: String,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
reportExecutionSchema.index({ report: 1 });
reportExecutionSchema.index({ schedule: 1 });
reportExecutionSchema.index({ executedBy: 1 });
reportExecutionSchema.index({ status: 1 });
reportExecutionSchema.index({ executedAt: -1 });

const ReportExecution = mongoose.model<IReportExecution>(
  'ReportExecution',
  reportExecutionSchema
);

export default ReportExecution;
