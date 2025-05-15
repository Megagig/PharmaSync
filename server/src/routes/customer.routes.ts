import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerAddress,
  updateCustomerAddress,
  removeCustomerAddress,
} from '../controllers/customer.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addCustomerAddressSchema,
  updateCustomerAddressSchema,
} from '../validators/customer.validator';
import { RoleType } from '../interfaces/role.interface';
import creditRoutes from './credit.routes';

const router = Router();

// Protect all routes
router.use(protect);

// Use credit routes
router.use('/:customerId/credit', creditRoutes);

// Get all customers and create customer
router
  .route('/')
  .get(getAllCustomers)
  .post(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(createCustomerSchema),
    createCustomer
  );

// Get, update, and delete customer by ID
router
  .route('/:id')
  .get(getCustomerById)
  .patch(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(updateCustomerSchema),
    updateCustomer
  )
  .delete(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), deleteCustomer);

// Address management
router
  .route('/:id/addresses')
  .post(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(addCustomerAddressSchema),
    addCustomerAddress
  );

router
  .route('/:id/addresses/:addressId')
  .patch(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(updateCustomerAddressSchema),
    updateCustomerAddress
  )
  .delete(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    removeCustomerAddress
  );

export default router;
