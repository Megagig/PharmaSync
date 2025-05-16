import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import * as posSessionController from '../controllers/posSession.controller';
import * as posTransactionController from '../controllers/posTransaction.controller';

const router = Router();

// Protect all routes
router.use(protect);

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

export default router;
