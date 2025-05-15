import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
} from '../controllers/invoice.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from '../validators/invoice.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all invoices and create invoice
router
  .route('/')
  .get(getAllInvoices)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(createInvoiceSchema),
    createInvoice
  );

// Get, update invoice by ID
router
  .route('/:id')
  .get(getInvoiceById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateInvoiceSchema),
    updateInvoice
  );

export default router;
