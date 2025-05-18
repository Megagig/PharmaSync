import api from './api';

const ReceiptService = {
  // Get receipt HTML
  getReceiptHtml: async (transactionId: string) => {
    const response = await api.get(`/receipts/${transactionId}/html`, {
      responseType: 'text',
    });
    return response.data;
  },

  // Send receipt email
  sendReceiptEmail: async (transactionId: string) => {
    const response = await api.post(`/receipts/${transactionId}/email`);
    return response.data.data;
  },

  // Schedule refill reminder
  scheduleRefillReminder: async (transactionId: string, reminderDate: Date) => {
    const response = await api.post(`/receipts/${transactionId}/refill-reminder`, {
      reminderDate,
    });
    return response.data.data;
  },

  // Send refill reminders (admin only)
  sendRefillReminders: async () => {
    const response = await api.post('/receipts/send-refill-reminders');
    return response.data.data;
  },
};

export default ReceiptService;
