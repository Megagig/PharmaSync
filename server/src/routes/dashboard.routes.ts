import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get dashboard statistics
router.get(
  '/stats',
  cacheMiddleware({
    expiration: 300, // Cache for 5 minutes
    keyGenerator: (req) =>
      `cache:dashboard:stats:${req.user?.id}:${JSON.stringify(req.query)}`,
  }),
  dashboardController.getDashboardStats
);

export default router;
