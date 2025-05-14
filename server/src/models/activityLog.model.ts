import mongoose, { Schema } from 'mongoose';
import { IActivityLog, ActivityType } from '../interfaces/activityLog.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We're using our own timestamp field
  }
);

// Create indexes for faster queries
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ activityType: 1 });
activityLogSchema.index({ timestamp: -1 });

const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;
