import express from 'express';
import * as loyaltyController from '../controllers/loyalty.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer loyalty routes
router.get('/customers/:customerId', loyaltyController.getCustomerLoyalty);
router.post('/customers/:customerId/add', loyaltyController.addLoyaltyPoints);
router.post('/customers/:customerId/redeem', loyaltyController.redeemLoyaltyPoints);

// Loyalty program routes (admin only)
router.get('/program', loyaltyController.getLoyaltyProgram);
router.post('/program', restrictTo('admin'), loyaltyController.createLoyaltyProgram);
router.patch('/program/:id', restrictTo('admin'), loyaltyController.updateLoyaltyProgram);

// Loyalty tier routes (admin only)
router.get('/tiers', loyaltyController.getLoyaltyTiers);
router.post('/tiers', restrictTo('admin'), loyaltyController.createLoyaltyTier);
router.patch('/tiers/:id', restrictTo('admin'), loyaltyController.updateLoyaltyTier);

// Process expired points (admin only)
router.post('/process-expired', restrictTo('admin'), loyaltyController.processExpiredPoints);

export default router;
