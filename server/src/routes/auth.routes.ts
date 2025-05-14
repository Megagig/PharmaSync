import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';
import cookieParser from 'cookie-parser';

const router = Router();

// Apply cookie parser middleware
router.use(cookieParser());

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail
);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getCurrentUser);
router.patch(
  '/me',
  validate(updateUserSchema),
  authController.updateCurrentUser
);
router.post(
  '/change-password',
  validate(changePasswordSchema),
  authController.changePassword
);
router.post('/logout', authController.logout);

export default router;
