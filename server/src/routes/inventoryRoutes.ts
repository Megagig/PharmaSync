import express from 'express';
import {
  getLowStockAlerts,
  getExpiringStockAlerts,
  getInventoryValuation,
  getInventoryByLocation,
  getInventoryMovements,
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all inventory routes
router.use(authenticate);

// Get low stock alerts
router.get('/low-stock', getLowStockAlerts);

// Get expiring stock alerts
router.get('/expiring', getExpiringStockAlerts);

// Get inventory valuation
router.get('/valuation', getInventoryValuation);

// Get inventory by location
router.get('/by-location', getInventoryByLocation);

// Get inventory movements
router.get('/movements', getInventoryMovements);

export default router;
