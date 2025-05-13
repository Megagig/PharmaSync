import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createMedicationSchema,
  updateMedicationSchema,
  addInventoryItemSchema,
  updateInventoryItemSchema,
  addSideEffectSchema,
  addInteractionSchema,
  addContraindicationSchema,
} from '../validators/medication.validator';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// All medication routes require authentication
router.use(authenticate);

// Get all medications
router.get('/', medicationController.getAllMedications);

// Get low stock medications
router.get('/low-stock', medicationController.getLowStockMedications);

// Get expiring medications
router.get('/expiring', medicationController.getExpiringMedications);

// Create medication (only admin and pharmacist)
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(createMedicationSchema),
  medicationController.createMedication
);

// Get, update, and delete medication by ID
router
  .route('/:id')
  .get(medicationController.getMedicationById)
  .patch(
    authorize(UserRole.ADMIN, UserRole.PHARMACIST),
    validate(updateMedicationSchema),
    medicationController.updateMedication
  )
  .delete(
    authorize(UserRole.ADMIN),
    medicationController.deleteMedication
  );

// Inventory management
router.post(
  '/:id/inventory',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.TECHNICIAN),
  validate(addInventoryItemSchema),
  medicationController.addInventoryItem
);

router
  .route('/:id/inventory/:itemId')
  .patch(
    authorize(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.TECHNICIAN),
    validate(updateInventoryItemSchema),
    medicationController.updateInventoryItem
  )
  .delete(
    authorize(UserRole.ADMIN, UserRole.PHARMACIST),
    medicationController.removeInventoryItem
  );

// Side effects management
router.post(
  '/:id/side-effects',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(addSideEffectSchema),
  medicationController.addSideEffect
);

router.delete(
  '/:id/side-effects/:sideEffectId',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  medicationController.removeSideEffect
);

// Interactions management
router.post(
  '/:id/interactions',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(addInteractionSchema),
  medicationController.addInteraction
);

router.delete(
  '/:id/interactions/:interactionId',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  medicationController.removeInteraction
);

// Contraindications management
router.post(
  '/:id/contraindications',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(addContraindicationSchema),
  medicationController.addContraindication
);

router.delete(
  '/:id/contraindications',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  medicationController.removeContraindication
);

export default router;
