import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.model';
import NotificationPreference from '../models/notificationPreference.model';
import { 
  NotificationType, 
  NotificationPriority,
  INotificationCreate 
} from '../interfaces/notification.interface';
import { AppError } from '../utils/error';
import { sendEmail } from '../services/email.service';

/**
 * @desc    Get all notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = { user: req.user.id };
  
  // Filter by read status
  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }
  
  // Filter by archived status
  if (req.query.isArchived !== undefined) {
    filter.isArchived = req.query.isArchived === 'true';
  }
  
  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  // Execute query with pagination
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Notification.countDocuments(filter);
  
  // Get unread count
  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
    isArchived: false,
  });
  
  res.status(200).json({
    status: 'success',
    data: notifications,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
      unreadCount,
    },
  });
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
export const getNotificationById = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // Check if the notification belongs to the current user
  if (notification.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this notification', 403);
  }
  
  res.status(200).json({
    status: 'success',
    data: notification,
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // Check if the notification belongs to the current user
  if (notification.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this notification', 403);
  }
  
  // Update notification
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  
  res.status(200).json({
    status: 'success',
    data: notification,
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

/**
 * @desc    Archive notification
 * @route   PATCH /api/notifications/:id/archive
 * @access  Private
 */
export const archiveNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // Check if the notification belongs to the current user
  if (notification.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this notification', 403);
  }
  
  // Update notification
  notification.isArchived = true;
  await notification.save();
  
  res.status(200).json({
    status: 'success',
    data: notification,
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  // Check if the notification belongs to the current user
  if (notification.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this notification', 403);
  }
  
  await notification.remove();
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Get notification types
 * @route   GET /api/notifications/types
 * @access  Private
 */
export const getNotificationTypes = asyncHandler(async (req: Request, res: Response) => {
  const notificationTypes = Object.values(NotificationType);
  
  res.status(200).json({
    status: 'success',
    data: notificationTypes,
  });
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
export const getNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
  let preferences = await NotificationPreference.findOne({ user: req.user.id });
  
  // If preferences don't exist, create default preferences
  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: req.user.id,
      email: {
        enabled: true,
        types: Object.values(NotificationType),
      },
      inApp: {
        enabled: true,
        types: Object.values(NotificationType),
      },
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: preferences,
  });
});

/**
 * @desc    Update notification preferences
 * @route   PATCH /api/notifications/preferences
 * @access  Private
 */
export const updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
  const { email, inApp } = req.body;
  
  let preferences = await NotificationPreference.findOne({ user: req.user.id });
  
  // If preferences don't exist, create them
  if (!preferences) {
    preferences = await NotificationPreference.create({
      user: req.user.id,
      email,
      inApp,
    });
  } else {
    // Update preferences
    if (email) {
      if (email.enabled !== undefined) {
        preferences.email.enabled = email.enabled;
      }
      if (email.types) {
        preferences.email.types = email.types;
      }
    }
    
    if (inApp) {
      if (inApp.enabled !== undefined) {
        preferences.inApp.enabled = inApp.enabled;
      }
      if (inApp.types) {
        preferences.inApp.types = inApp.types;
      }
    }
    
    await preferences.save();
  }
  
  res.status(200).json({
    status: 'success',
    data: preferences,
  });
});

/**
 * @desc    Create a notification (internal use only)
 * @access  Private
 */
export const createNotification = async (notificationData: INotificationCreate) => {
  try {
    const { user, type, title, message, priority = NotificationPriority.MEDIUM, data, link } = notificationData;
    
    // Check if user has notification preferences
    const preferences = await NotificationPreference.findOne({ user });
    
    // Create in-app notification if enabled for this type
    if (!preferences || 
        (preferences.inApp.enabled && preferences.inApp.types.includes(type))) {
      await Notification.create({
        user,
        type,
        title,
        message,
        priority,
        data,
        link,
      });
    }
    
    // Send email notification if enabled for this type
    if (!preferences || 
        (preferences.email.enabled && preferences.email.types.includes(type))) {
      // Get user email
      const userDoc = await require('../models/user.model').default.findById(user);
      
      if (userDoc && userDoc.email) {
        await sendEmail({
          to: userDoc.email,
          subject: title,
          text: message,
          html: `<p>${message}</p>${link ? `<p>View details: <a href="${link}">${link}</a></p>` : ''}`,
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};
