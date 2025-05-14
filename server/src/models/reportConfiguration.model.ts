import mongoose, { Schema } from 'mongoose';
import {
  IReportConfiguration,
  ReportType,
  ChartType,
} from '../interfaces/report.interface';

const reportFilterSchema = new Schema(
  {
    field: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      enum: [
        'equals',
        'notEquals',
        'contains',
        'greaterThan',
        'lessThan',
        'between',
        'in',
      ],
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const reportChartSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ChartType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    dataField: {
      type: String,
      required: true,
    },
    labelField: {
      type: String,
      required: true,
    },
    groupBy: {
      type: String,
    },
    aggregation: {
      type: String,
      enum: ['sum', 'avg', 'count', 'min', 'max'],
    },
    options: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const reportConfigurationSchema = new Schema<IReportConfiguration>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ReportType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    filters: [reportFilterSchema],
    charts: [reportChartSchema],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
reportConfigurationSchema.index({ createdBy: 1 });
reportConfigurationSchema.index({ type: 1 });
reportConfigurationSchema.index({ isPublic: 1 });
reportConfigurationSchema.index({ createdAt: -1 });

const ReportConfiguration = mongoose.model<IReportConfiguration>(
  'ReportConfiguration',
  reportConfigurationSchema
);

export default ReportConfiguration;
