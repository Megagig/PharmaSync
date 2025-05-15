import { Router } from 'express';
import {
  getAllLocations,
  getAllActiveLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  setLocationAsDefault,
} from '../controllers/location.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createLocationSchema,
  updateLocationSchema,
} from '../validators/location.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all active locations (no pagination)
router.get('/active', getAllActiveLocations);

// Get all locations and create location
router
  .route('/')
  .get(getAllLocations)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(createLocationSchema),
    createLocation
  );

// Get, update, and delete location by ID
router
  .route('/:id')
  .get(getLocationById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateLocationSchema),
    updateLocation
  )
  .delete(
    restrictTo([RoleType.ADMIN]),
    deleteLocation
  );

// Set location as default
router.patch(
  '/:id/set-default',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  setLocationAsDefault
);

export default router;
