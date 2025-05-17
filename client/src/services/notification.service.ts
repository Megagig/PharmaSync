import api from '@/services/api';
import {
  // These types are used in the return types of the functions
  // but TypeScript doesn't recognize this usage pattern
  // Notification,
  // NotificationPreference,
  // NotificationType,
  NotificationFilters,
  NotificationPreferenceUpdateData,
} from '@/types/notification.types';

const BASE_URL = '/notifications';

/**
 * Get all notifications for the current user
 * @param filters Notification filters
 * @returns Promise with notifications data
 */
export const getNotifications = async (filters: NotificationFilters = {}) => {
  const { page = 1, limit = 20, isRead, isArchived, type } = filters;

  let url = `${BASE_URL}?page=${page}&limit=${limit}`;

  if (isRead !== undefined) {
    url += `&isRead=${isRead}`;
  }

  if (isArchived !== undefined) {
    url += `&isArchived=${isArchived}`;
  }

  if (type) {
    url += `&type=${type}`;
  }

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], meta: { total: 0, pages: 0, page: 1, unreadCount: 0 } };
  }
};

/**
 * Get a notification by ID
 * @param id Notification ID
 * @returns Promise with notification data
 */
export const getNotificationById = async (id: string) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notification ${id}:`, error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @returns Promise with updated notification data
 */
export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/read`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns Promise with success message
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch(`${BASE_URL}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Archive a notification
 * @param id Notification ID
 * @returns Promise with updated notification data
 */
export const archiveNotification = async (id: string) => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/archive`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving notification ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param id Notification ID
 * @returns Promise with success message
 */
export const deleteNotification = async (id: string) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    throw error;
  }
};

/**
 * Get notification types
 * @returns Promise with notification types
 */
export const getNotificationTypes = async () => {
  try {
    const response = await api.get(`${BASE_URL}/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification types:', error);
    return { data: [] };
  }
};

/**
 * Get notification preferences
 * @returns Promise with notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get(`${BASE_URL}/preferences`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return { data: null };
  }
};

/**
 * Update notification preferences
 * @param data Notification preference update data
 * @returns Promise with updated notification preferences
 */
export const updateNotificationPreferences = async (
  data: NotificationPreferenceUpdateData
) => {
  try {
    const response = await api.patch(`${BASE_URL}/preferences`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};
