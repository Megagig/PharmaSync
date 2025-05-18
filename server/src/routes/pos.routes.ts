import express from 'express';
import * as posController from '../controllers/pos.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createSaleSchema,
  voidSaleSchema,
  getSalesSchema,
} from '../schemas/pos.schema';
import { Router } from 'express';
import { restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { Permission } from '../interfaces/user.interface';
import * as posSessionController from '../controllers/posSession.controller';
import * as posTransactionController from '../controllers/posTransaction.controller';
import posReturnRoutes from './posReturn.routes';

const router = express.Router();

// Protect all routes
router.use(protect);

// Mount POS return routes
router.use('/returns', posReturnRoutes);

// POS Session routes
router.get(
  '/sessions',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posSessionController.getAllPosSessions
);

router.get(
  '/sessions/active',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posSessionController.getActivePosSession
);

router.get(
  '/sessions/:id',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posSessionController.getPosSessionById
);

router.post(
  '/sessions',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posSessionController.createPosSession
);

router.put(
  '/sessions/:id/close',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posSessionController.closePosSession
);

router.delete(
  '/sessions/:id',
  restrictTo([
    RoleType.ADMIN, // Only admin can delete sessions
  ]),
  posSessionController.deletePosSession
);

// POS Transaction routes
router.get(
  '/transactions',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posTransactionController.getAllPosTransactions
);

router.get(
  '/transactions/:id',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posTransactionController.getPosTransactionById
);

router.post(
  '/transactions',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posTransactionController.createPosTransaction
);

router.get(
  '/transactions/:id/receipt',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posTransactionController.generatePosReceipt
);

router
  .route('/sales')
  .post(
    authorize('create:sales' as Permission),
    validateRequest(createSaleSchema),
    posController.createSale
  )
  .get(
    authorize('read:sales' as Permission),
    validateRequest(getSalesSchema),
    posController.getSales
  );

router
  .route('/sales/:id')
  .get(authorize('read:sales' as Permission), posController.getSaleById);

router
  .route('/sales/:id/void')
  .patch(
    authorize('void:sales' as Permission),
    validateRequest(voidSaleSchema),
    posController.voidSale
  );

export default router;
