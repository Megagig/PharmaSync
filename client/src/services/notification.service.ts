import api from './api';
import { 
  Notification, 
  NotificationFilters, 
  NotificationPreference,
  NotificationPreferenceUpdateData,
  NotificationType
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
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get a notification by ID
 * @param id Notification ID
 * @returns Promise with notification data
 */
export const getNotificationById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @returns Promise with updated notification data
 */
export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns Promise with success message
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(`${BASE_URL}/read-all`);
  return response.data;
};

/**
 * Archive a notification
 * @param id Notification ID
 * @returns Promise with updated notification data
 */
export const archiveNotification = async (id: string) => {
  const response = await api.patch(`${BASE_URL}/${id}/archive`);
  return response.data;
};

/**
 * Delete a notification
 * @param id Notification ID
 * @returns Promise with success message
 */
export const deleteNotification = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get notification types
 * @returns Promise with notification types
 */
export const getNotificationTypes = async () => {
  const response = await api.get(`${BASE_URL}/types`);
  return response.data;
};

/**
 * Get notification preferences
 * @returns Promise with notification preferences
 */
export const getNotificationPreferences = async () => {
  const response = await api.get(`${BASE_URL}/preferences`);
  return response.data;
};

/**
 * Update notification preferences
 * @param data Notification preference update data
 * @returns Promise with updated notification preferences
 */
export const updateNotificationPreferences = async (data: NotificationPreferenceUpdateData) => {
  const response = await api.patch(`${BASE_URL}/preferences`, data);
  return response.data;
};
