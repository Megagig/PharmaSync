import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  getUserRoles,
  getUserRolesByUserId,
  assignRoleToUser,
  removeRoleFromUser,
  getUserPermissions,
  checkUserPermission,
} from '../controllers/userRole.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Restrict all routes to admin
router.use(restrictTo(['admin']));

// User role routes
router.get('/', getUserRoles);

// User-specific role routes
router.get('/users/:userId/roles', getUserRolesByUserId);
router.post('/users/:userId/roles', assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', removeRoleFromUser);

// User permission routes
router.get('/users/:userId/permissions', getUserPermissions);
router.get('/users/:userId/permissions/check', checkUserPermission);

export default router;
