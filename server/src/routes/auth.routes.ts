import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getCurrentUser);
router.patch('/me', validate(updateUserSchema), authController.updateCurrentUser);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);

export default router;
