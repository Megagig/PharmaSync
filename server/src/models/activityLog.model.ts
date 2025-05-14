import mongoose, { Schema, Document, Types } from 'mongoose';
import {
  IActivityLog,
  ActivityType,
} from '../interfaces/activityLog.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ type: 1 });
activityLogSchema.index({ createdAt: -1 });

// For backward compatibility, add virtual fields
activityLogSchema
  .virtual('activityType')
  .get(function (this: Document & IActivityLog) {
    return this.type;
  });

activityLogSchema
  .virtual('details')
  .get(function (this: Document & IActivityLog) {
    return this.metadata;
  });

activityLogSchema
  .virtual('timestamp')
  .get(function (this: Document & IActivityLog) {
    return this.createdAt;
  });

const ActivityLog = mongoose.model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);

export default ActivityLog;
