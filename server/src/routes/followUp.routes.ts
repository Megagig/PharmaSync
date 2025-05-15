import express from 'express';
import * as followUpController from '../controllers/followUp.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';

const router = express.Router();

// Apply authentication middleware to all follow-up routes
router.use(authenticate);

// Trigger follow-up notifications (admin only)
router.post(
  '/trigger-notifications',
  authorize(['admin']),
  followUpController.triggerFollowUpNotifications
);

export default router;
