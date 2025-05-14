import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationTypes,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notification.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get notification types
router.get('/types', getNotificationTypes);

// Get and update notification preferences
router.get('/preferences', getNotificationPreferences);
router.patch('/preferences', updateNotificationPreferences);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Get all notifications for the current user
router.get('/', getMyNotifications);

// Get, mark as read, archive, and delete a notification
router.get('/:id', getNotificationById);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/:id/archive', archiveNotification);
router.delete('/:id', deleteNotification);

export default router;
