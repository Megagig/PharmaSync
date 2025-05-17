import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import {
  createMedicationSchema,
  updateMedicationSchema,
  addInventoryItemSchema,
  updateInventoryItemSchema,
  addSideEffectSchema,
  addInteractionSchema,
  addContraindicationSchema,
} from '../validators/medication.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// All medication routes require authentication
router.use(authenticate);

// Get all medications
router.get(
  '/',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  medicationController.getAllMedications
);

// Get low stock medications
router.get(
  '/low-stock',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  medicationController.getLowStockMedications
);

// Get expiring medications
router.get(
  '/expiring',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  medicationController.getExpiringMedications
);

// Medication database endpoint
router.get(
  '/database',
  cacheMiddleware({ expiration: 3600 }), // Cache for 1 hour
  medicationController.getMedicationDatabase
);

// Create medication (only admin and pharmacist)
router.post(
  '/',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createMedicationSchema),
  async (req, res, next) => {
    // Clear medication caches when a new medication is created
    await clearCache('GET:/medications');
    await clearCache('GET:/medications/low-stock');
    await clearCache('GET:/medications/expiring');
    next();
  },
  medicationController.createMedication
);

// Get, update, and delete medication by ID
router
  .route('/:id')
  .get(
    cacheMiddleware({ expiration: 600 }), // Cache for 10 minutes
    medicationController.getMedicationById
  )
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateMedicationSchema),
    async (req, res, next) => {
      // Clear specific medication cache when updated
      await clearCache(`GET:/medications/${req.params.id}`);
      // Also clear the all medications list cache
      await clearCache('GET:/medications');
      await clearCache('GET:/medications/low-stock');
      await clearCache('GET:/medications/expiring');
      next();
    },
    medicationController.updateMedication
  )
  .delete(
    restrictTo([RoleType.ADMIN]),
    async (req, res, next) => {
      // Clear specific medication cache when deleted
      await clearCache(`GET:/medications/${req.params.id}`);
      // Also clear the all medications list cache
      await clearCache('GET:/medications');
      await clearCache('GET:/medications/low-stock');
      await clearCache('GET:/medications/expiring');
      next();
    },
    medicationController.deleteMedication
  );

// Inventory management
router.post(
  '/:id/inventory',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  validate(addInventoryItemSchema),
  medicationController.addInventoryItem
);

router
  .route('/:id/inventory/:itemId')
  .patch(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(updateInventoryItemSchema),
    medicationController.updateInventoryItem
  )
  .delete(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    medicationController.removeInventoryItem
  );

// Side effects management
router.post(
  '/:id/side-effects',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(addSideEffectSchema),
  medicationController.addSideEffect
);

router.delete(
  '/:id/side-effects/:sideEffectId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  medicationController.removeSideEffect
);

// Interactions management
router.post(
  '/:id/interactions',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(addInteractionSchema),
  medicationController.addInteraction
);

router.delete(
  '/:id/interactions/:interactionId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  medicationController.removeInteraction
);

// Contraindications management
router.post(
  '/:id/contraindications',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(addContraindicationSchema),
  medicationController.addContraindication
);

router.delete(
  '/:id/contraindications',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  medicationController.removeContraindication
);

export default router;
