import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { RoleType } from '../interfaces/role.interface';
import * as insuranceController from '../controllers/insurance.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Insurance Provider routes
router.route('/providers')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsuranceProviders
  )
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    insuranceController.createInsuranceProvider
  );

router.route('/providers/:id')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsuranceProviderById
  )
  .put(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    insuranceController.updateInsuranceProvider
  )
  .delete(
    restrictTo([RoleType.ADMIN]),
    insuranceController.deleteInsuranceProvider
  );

// Insurance Plan routes
router.route('/plans')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsurancePlans
  )
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    insuranceController.createInsurancePlan
  );

router.route('/plans/:id')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsurancePlanById
  )
  .put(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    insuranceController.updateInsurancePlan
  )
  .delete(
    restrictTo([RoleType.ADMIN]),
    insuranceController.deleteInsurancePlan
  );

// Customer Insurance routes
router.route('/customer-insurances')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getCustomerInsurances
  )
  .post(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    insuranceController.createCustomerInsurance
  );

router.route('/customer-insurances/:id')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getCustomerInsuranceById
  )
  .put(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    insuranceController.updateCustomerInsurance
  )
  .delete(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    insuranceController.deleteCustomerInsurance
  );

// Insurance Eligibility Check route
router.post(
  '/check-eligibility',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
    RoleType.CASHIER,
  ]),
  insuranceController.checkInsuranceEligibility
);

// Insurance Claim routes
router.route('/claims')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsuranceClaims
  )
  .post(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.createInsuranceClaim
  );

router.route('/claims/:id')
  .get(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
      RoleType.CASHIER,
    ]),
    insuranceController.getInsuranceClaimById
  );

router.patch(
  '/claims/:id/status',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  insuranceController.updateInsuranceClaimStatus
);

export default router;
