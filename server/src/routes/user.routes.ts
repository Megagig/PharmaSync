import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
  changeUserProfilePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, Permission } from '../interfaces/user.interface';
import { RoleType } from '../interfaces/role.interface';
import { z } from 'zod';

const router = Router();

// Public routes
router.post(
  '/forgot-password',
  validate(
    z.object({
      body: z.object({
        email: z.string().email('Invalid email address'),
      }),
    })
  ),
  forgotPassword
);

router.patch(
  '/reset-password/:token',
  validate(
    z.object({
      body: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
      }),
      params: z.object({
        token: z.string().min(1, 'Token is required'),
      }),
    })
  ),
  resetPassword
);

// Protected routes
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);

router.patch(
  '/profile',
  validate(
    z.object({
      body: z.object({
        firstName: z.string().min(1, 'First name is required').optional(),
        lastName: z.string().min(1, 'Last name is required').optional(),
        phoneNumber: z.string().optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        emergencyContact: z
          .object({
            name: z.string().optional(),
            relationship: z.string().optional(),
            phoneNumber: z.string().optional(),
          })
          .optional(),
        profileImage: z.string().optional(),
      }),
    })
  ),
  updateUserProfile
);

router.patch(
  '/profile/change-password',
  validate(
    z.object({
      body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
          .string()
          .min(6, 'New password must be at least 6 characters'),
      }),
    })
  ),
  changeUserProfilePassword
);

// Admin routes
router.get('/', restrictTo([RoleType.ADMIN]), getAllUsers);

router.get(
  '/:id',
  restrictTo([RoleType.ADMIN]),
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  getUserById
);

router.post(
  '/',
  restrictTo([RoleType.ADMIN]),
  validate(
    z.object({
      body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        role: z.enum(Object.values(UserRole) as [string, ...string[]]),
        permissions: z
          .array(z.enum(Object.values(Permission) as [string, ...string[]]))
          .optional(),
        phoneNumber: z.string().optional(),
        licenseNumber: z.string().optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        dateOfBirth: z.string().optional(),
        emergencyContact: z
          .object({
            name: z.string().optional(),
            relationship: z.string().optional(),
            phoneNumber: z.string().optional(),
          })
          .optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        hireDate: z.string().optional(),
        profileImage: z.string().optional(),
      }),
    })
  ),
  createUser
);

router.patch(
  '/:id',
  restrictTo([RoleType.ADMIN]),
  validate(
    z.object({
      body: z.object({
        firstName: z.string().min(1, 'First name is required').optional(),
        lastName: z.string().min(1, 'Last name is required').optional(),
        role: z
          .enum(Object.values(UserRole) as [string, ...string[]])
          .optional(),
        permissions: z
          .array(z.enum(Object.values(Permission) as [string, ...string[]]))
          .optional(),
        phoneNumber: z.string().optional(),
        licenseNumber: z.string().optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        dateOfBirth: z.string().optional(),
        emergencyContact: z
          .object({
            name: z.string().optional(),
            relationship: z.string().optional(),
            phoneNumber: z.string().optional(),
          })
          .optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        hireDate: z.string().optional(),
        profileImage: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  updateUser
);

router.delete(
  '/:id',
  restrictTo([RoleType.ADMIN]),
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  deleteUser
);

router.patch(
  '/:id/change-password',
  restrictTo([RoleType.ADMIN]),
  validate(
    z.object({
      body: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
      }),
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  changeUserPassword
);

export default router;
