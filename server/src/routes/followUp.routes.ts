import express from 'express';
import * as followUpController from '../controllers/followUp.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Permission } from '../interfaces/user.interface';

const router = express.Router();

// Apply authentication middleware to all follow-up routes
router.use(authenticate);

// Trigger follow-up notifications (admin only)
router.post(
  '/trigger-notifications',
  authorize(Permission.MANAGE_ROLES),
  followUpController.triggerFollowUpNotifications
);

export default router;
