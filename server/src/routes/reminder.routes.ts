import { Router } from 'express';
import {
  getAllReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  sendReminder,
  generateInvoiceDueReminders,
  generateInvoiceOverdueReminders,
} from '../controllers/reminder.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReminderSchema,
  updateReminderSchema,
} from '../validators/reminder.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all reminders and create reminder
router
  .route('/')
  .get(getAllReminders)
  .post(validate(createReminderSchema), createReminder);

// Generate reminders
router
  .route('/generate/invoice-due')
  .post(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), generateInvoiceDueReminders);

router
  .route('/generate/invoice-overdue')
  .post(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), generateInvoiceOverdueReminders);

// Get, update, delete reminder by ID
router
  .route('/:id')
  .get(getReminderById)
  .patch(validate(updateReminderSchema), updateReminder)
  .delete(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), deleteReminder);

// Send reminder
router
  .route('/:id/send')
  .post(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), sendReminder);

export default router;
