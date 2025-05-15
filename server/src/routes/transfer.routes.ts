import { Router } from 'express';
import {
  createTransfer,
  getTransfers,
  getTransferById,
} from '../controllers/transfer.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);

// Create transfer schema
const createTransferSchema = z.object({
  body: z
    .object({
      sourceLocation: z.string().min(1, 'Source location is required'),
      destinationLocation: z
        .string()
        .min(1, 'Destination location is required'),
      items: z
        .array(
          z.object({
            product: z.string().optional(),
            medication: z.string().optional(),
            batchNumber: z.string().min(1, 'Batch number is required'),
            quantity: z
              .number()
              .int()
              .positive('Quantity must be a positive integer'),
          })
        )
        .min(1, 'At least one item is required'),
      notes: z.string().optional(),
    })
    .refine((data) => data.sourceLocation !== data.destinationLocation, {
      message: 'Source and destination locations cannot be the same',
      path: ['destinationLocation'],
    }),
});

// Get all transfers
router.get('/', getTransfers);

// Get transfer by ID
router.get('/:id', getTransferById);

// Create transfer
router.post(
  '/',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createTransferSchema),
  createTransfer
);

// TODO: Implement these routes when the controllers are ready
// // Approve transfer
// router.patch(
//   '/:id/approve',
//   restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
//   approveTransfer
// );
//
// // Complete transfer
// router.patch(
//   '/:id/complete',
//   restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
//   completeTransfer
// );
//
// // Cancel transfer
// router.patch(
//   '/:id/cancel',
//   restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
//   cancelTransfer
// );

export default router;
