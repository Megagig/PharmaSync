import api from './api';
import { 
  Reminder, 
  ReminderFormData, 
  ReminderUpdateData 
} from '../types/reminder.types';

const reminderService = {
  getAllReminders: async (
    page = 1,
    limit = 10,
    customer = '',
    type = '',
    status = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Reminder[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/reminders?page=${page}&limit=${limit}`;
    
    if (customer) {
      url += `&customer=${customer}`;
    }
    
    if (type) {
      url += `&type=${type}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  getReminderById: async (id: string): Promise<Reminder> => {
    const response = await api.get(`/reminders/${id}`);
    return response.data.data;
  },

  createReminder: async (reminderData: ReminderFormData): Promise<Reminder> => {
    const response = await api.post('/reminders', reminderData);
    return response.data.data;
  },

  updateReminder: async (id: string, updateData: ReminderUpdateData): Promise<Reminder> => {
    const response = await api.patch(`/reminders/${id}`, updateData);
    return response.data.data;
  },

  deleteReminder: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },

  sendReminder: async (id: string): Promise<Reminder> => {
    const response = await api.post(`/reminders/${id}/send`);
    return response.data.data;
  },

  generateInvoiceDueReminders: async (): Promise<{
    count: number;
    reminders: Reminder[];
  }> => {
    const response = await api.post('/reminders/generate/invoice-due');
    return response.data.data;
  },

  generateInvoiceOverdueReminders: async (): Promise<{
    count: number;
    reminders: Reminder[];
  }> => {
    const response = await api.post('/reminders/generate/invoice-overdue');
    return response.data.data;
  },
};

export default reminderService;
