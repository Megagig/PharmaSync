import { z } from 'zod';
import { UserRole } from '../interfaces/user.interface';

// Password validation regex patterns
const containsUppercase = /[A-Z]/;
const containsLowercase = /[a-z]/;
const containsNumber = /[0-9]/;
const containsSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
  }),
});

export const registerSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .email('Invalid email address')
        .min(1, 'Email is required'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .refine((password) => containsUppercase.test(password), {
          message: 'Password must contain at least one uppercase letter',
        })
        .refine((password) => containsLowercase.test(password), {
          message: 'Password must contain at least one lowercase letter',
        })
        .refine((password) => containsNumber.test(password), {
          message: 'Password must contain at least one number',
        })
        .refine((password) => containsSpecial.test(password), {
          message: 'Password must contain at least one special character',
        }),
      confirmPassword: z.string(),
      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long'),
      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long'),
      role: z.enum([
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.TECHNICIAN,
        UserRole.STAFF,
      ]),
      phoneNumber: z.string().optional(),
      licenseNumber: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .optional(),
    phoneNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(100, 'New password is too long')
        .refine((password) => containsUppercase.test(password), {
          message: 'Password must contain at least one uppercase letter',
        })
        .refine((password) => containsLowercase.test(password), {
          message: 'Password must contain at least one lowercase letter',
        })
        .refine((password) => containsNumber.test(password), {
          message: 'Password must contain at least one number',
        })
        .refine((password) => containsSpecial.test(password), {
          message: 'Password must contain at least one special character',
        }),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'Token is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .refine((password) => containsUppercase.test(password), {
          message: 'Password must contain at least one uppercase letter',
        })
        .refine((password) => containsLowercase.test(password), {
          message: 'Password must contain at least one lowercase letter',
        })
        .refine((password) => containsNumber.test(password), {
          message: 'Password must contain at least one number',
        })
        .refine((password) => containsSpecial.test(password), {
          message: 'Password must contain at least one special character',
        }),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});
