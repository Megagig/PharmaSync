import { Router } from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  generateReceipt,
} from '../controllers/sale.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSaleSchema,
  updateSaleSchema,
} from '../validators/sale.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all sales and create sale
router
  .route('/')
  .get(getAllSales)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(createSaleSchema),
    createSale
  );

// Get, update sale by ID
router
  .route('/:id')
  .get(getSaleById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(updateSaleSchema),
    updateSale
  );

// Generate receipt
router
  .route('/:id/receipt')
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    generateReceipt
  );

export default router;
