import api from './api';

export interface ExpiryNotificationSettings {
  enabled: boolean;
  emailRecipients: string[];
  notificationDays: number[];
  sendTime: string;
  includeInventoryReport: boolean;
}

/**
 * Get expiry notification settings
 */
export const getExpiryNotificationSettings = async (): Promise<ExpiryNotificationSettings> => {
  const response = await api.get('/settings/expiry-notifications');
  return response.data.data;
};

/**
 * Update expiry notification settings
 */
export const updateExpiryNotificationSettings = async (
  settings: ExpiryNotificationSettings
): Promise<ExpiryNotificationSettings> => {
  const response = await api.put('/settings/expiry-notifications', settings);
  return response.data.data;
};

/**
 * Send expiry notifications
 */
export const sendExpiryNotifications = async (): Promise<{ message: string }> => {
  const response = await api.post('/inventory/send-expiry-notifications');
  return response.data;
};
