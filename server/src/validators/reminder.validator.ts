import { z } from 'zod';
import { ReminderStatus, ReminderType } from '../interfaces/reminder.interface';

export const createReminderSchema = z.object({
  body: z.object({
    customer: z.string().min(1, 'Customer ID is required'),
    type: z.enum(Object.values(ReminderType) as [string, ...string[]]),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    invoice: z.string().optional(),
    payment: z.string().optional(),
  }),
});

export const updateReminderSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(ReminderStatus) as [string, ...string[]]).optional(),
    subject: z.string().min(1, 'Subject is required').optional(),
    message: z.string().min(1, 'Message is required').optional(),
    scheduledDate: z.string().min(1, 'Scheduled date is required').optional(),
  }),
});
