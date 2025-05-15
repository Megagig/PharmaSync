import Notification from '../models/notification.model';
import User from '../models/user.model';
import Patient from '../models/patient.model';
import { INotification, NotificationType } from '../types/notification.types';
import { formatDate } from '../utils/date.utils';

/**
 * Create a new notification
 * @param notification Notification data
 * @returns Created notification
 */
export const createNotification = async (notification: Partial<INotification>): Promise<INotification> => {
  const newNotification = await Notification.create(notification);
  return newNotification;
};

/**
 * Get notifications for a user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @param unreadOnly Get only unread notifications
 * @returns Notifications and pagination data
 */
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  unreadOnly: boolean = false
): Promise<{ notifications: INotification[]; total: number; pages: number }> => {
  const query: any = { userId };
  
  if (unreadOnly) {
    query.read = false;
  }
  
  const total = await Notification.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  return { notifications, total, pages };
};

/**
 * Mark a notification as read
 * @param notificationId Notification ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (notificationId: string): Promise<INotification | null> => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
  
  return notification;
};

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 * @returns Number of notifications updated
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );
  
  return result.modifiedCount;
};

/**
 * Delete a notification
 * @param notificationId Notification ID
 * @returns Deleted notification
 */
export const deleteNotification = async (notificationId: string): Promise<INotification | null> => {
  const notification = await Notification.findByIdAndDelete(notificationId);
  return notification;
};

/**
 * Create follow-up notifications for upcoming care plans
 * This function should be run daily by a scheduled job
 * @returns Number of notifications created
 */
export const createFollowUpNotifications = async (): Promise<number> => {
  // Get all patients with care plans
  const patients = await Patient.find({ 'carePlans.0': { $exists: true } });
  
  let notificationsCreated = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check for upcoming follow-ups in the next 3 days
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  // Get all users (pharmacists) to notify
  const users = await User.find({ role: { $in: ['admin', 'pharmacist'] } });
  
  for (const patient of patients) {
    if (!patient.carePlans) continue;
    
    for (const carePlan of patient.carePlans) {
      if (!carePlan.followUpDate) continue;
      
      const followUpDate = new Date(carePlan.followUpDate);
      followUpDate.setHours(0, 0, 0, 0);
      
      // Check if follow-up is in the next 3 days
      if (followUpDate >= today && followUpDate <= threeDaysFromNow) {
        // Create a notification for each user
        for (const user of users) {
          // Check if notification already exists
          const existingNotification = await Notification.findOne({
            userId: user._id,
            'data.patientId': patient._id,
            'data.carePlanId': carePlan._id,
            type: NotificationType.FOLLOW_UP_REMINDER,
            read: false
          });
          
          if (!existingNotification) {
            // Create a new notification
            await createNotification({
              userId: user._id,
              title: 'Follow-up Reminder',
              message: `Follow-up for ${patient.firstName} ${patient.lastName} is scheduled for ${formatDate(followUpDate)}`,
              type: NotificationType.FOLLOW_UP_REMINDER,
              read: false,
              data: {
                patientId: patient._id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                carePlanId: carePlan._id,
                followUpDate: followUpDate
              }
            });
            
            notificationsCreated++;
          }
        }
      }
    }
  }
  
  return notificationsCreated;
};

/**
 * Create SOAP note follow-up notifications
 * This function should be run daily by a scheduled job
 * @returns Number of notifications created
 */
export const createSoapNoteFollowUpNotifications = async (): Promise<number> => {
  // Get all patients with SOAP notes
  const patients = await Patient.find({ 'soapNotes.0': { $exists: true } });
  
  let notificationsCreated = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check for upcoming follow-ups in the next 3 days
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  // Get all users (pharmacists) to notify
  const users = await User.find({ role: { $in: ['admin', 'pharmacist'] } });
  
  for (const patient of patients) {
    if (!patient.soapNotes) continue;
    
    for (const soapNote of patient.soapNotes) {
      if (!soapNote.followUpDate) continue;
      
      const followUpDate = new Date(soapNote.followUpDate);
      followUpDate.setHours(0, 0, 0, 0);
      
      // Check if follow-up is in the next 3 days
      if (followUpDate >= today && followUpDate <= threeDaysFromNow) {
        // Create a notification for each user
        for (const user of users) {
          // Check if notification already exists
          const existingNotification = await Notification.findOne({
            userId: user._id,
            'data.patientId': patient._id,
            'data.soapNoteId': soapNote._id,
            type: NotificationType.SOAP_NOTE_FOLLOW_UP_REMINDER,
            read: false
          });
          
          if (!existingNotification) {
            // Create a new notification
            await createNotification({
              userId: user._id,
              title: 'SOAP Note Follow-up Reminder',
              message: `Follow-up for ${patient.firstName} ${patient.lastName} is scheduled for ${formatDate(followUpDate)}`,
              type: NotificationType.SOAP_NOTE_FOLLOW_UP_REMINDER,
              read: false,
              data: {
                patientId: patient._id,
                patientName: `${patient.firstName} ${patient.lastName}`,
                soapNoteId: soapNote._id,
                followUpDate: followUpDate
              }
            });
            
            notificationsCreated++;
          }
        }
      }
    }
  }
  
  return notificationsCreated;
};

/**
 * Get unread notification count for a user
 * @param userId User ID
 * @returns Number of unread notifications
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const count = await Notification.countDocuments({ userId, read: false });
  return count;
};
