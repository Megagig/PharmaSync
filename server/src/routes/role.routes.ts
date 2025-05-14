import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  resetRolePermissions,
  getRoleUsers,
  assignRoleToUser,
  removeRoleFromUser,
} from '../controllers/role.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Restrict all routes to admin
router.use(restrictTo(['admin']));

// Role routes
router.get('/', getRoles);
router.post('/', createRole);
router.get('/:id', getRoleById);
router.patch('/:id', updateRole);
router.delete('/:id', deleteRole);
router.post('/:id/reset', resetRolePermissions);
router.get('/:id/users', getRoleUsers);
router.post('/:id/assign', assignRoleToUser);
router.delete('/:id/users/:userId', removeRoleFromUser);

export default router;
