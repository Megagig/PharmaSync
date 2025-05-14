import mongoose, { Schema } from 'mongoose';
import { 
  INotificationPreference, 
  NotificationType 
} from '../interfaces/notification.interface';

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    email: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: {
        type: [String],
        enum: Object.values(NotificationType),
        default: Object.values(NotificationType),
      },
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: {
        type: [String],
        enum: Object.values(NotificationType),
        default: Object.values(NotificationType),
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
notificationPreferenceSchema.index({ user: 1 });

const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);

export default NotificationPreference;
