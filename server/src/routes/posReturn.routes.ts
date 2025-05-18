import express from 'express';
import * as posReturnController from '../controllers/posReturn.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get returnable transactions for a customer
router.get('/customer/:customerId', posReturnController.getReturnableTransactions);

// Get transaction details for return
router.get('/transaction/:transactionId', posReturnController.getTransactionForReturn);

// Process returns
router.post('/full', posReturnController.processFullReturn);
router.post('/partial', posReturnController.processPartialReturn);

// Get return details
router.get('/:returnId', posReturnController.getReturnDetails);

export default router;
