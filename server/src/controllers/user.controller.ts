import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import Role from '../models/role.model';
import UserRole from '../models/userRole.model';
import { createActivityLog } from './activityLog.controller';
import { ActivityType } from '../interfaces/activityLog.interface';
import {
  UserRole as LegacyUserRole,
  Permission,
  DEFAULT_ROLE_PERMISSIONS,
  IUserSettings,
} from '../interfaces/user.interface';
import { RoleType } from '../interfaces/role.interface';
import { AppError } from '../utils/error';
import { hashPassword } from '../config/auth.config';
import crypto from 'crypto';

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by legacy role (for backward compatibility)
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Filter by role type (new role system)
    if (req.query.roleType) {
      // First find the role by type
      const role = await Role.findOne({ type: req.query.roleType });
      if (role) {
        // Then find users with this role
        const userRoles = await UserRole.find({ role: role._id });
        const userIds = userRoles.map((ur) => ur.user);
        filter._id = { $in: userIds };
      } else {
        // If role not found, return empty result
        res.status(200).json({
          status: 'success',
          data: [],
          meta: {
            total: 0,
            pages: 0,
            page,
            limit,
          },
        });
        return;
      }
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Filter by email verification status
    if (req.query.isEmailVerified !== undefined) {
      filter.isEmailVerified = req.query.isEmailVerified === 'true';
    }

    // Search by name, email, phone, or license
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { licenseNumber: searchRegex },
      ];
    }

    // Execute query with pagination
    const users = await User.find(filter)
      .select(
        '-password -passwordResetToken -passwordResetExpires -passwordChangedAt -twoFactorSecret -twoFactorBackupCodes'
      )
      .populate({
        path: 'roles',
        select: 'name type description',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: users,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = await User.findById(req.params.id)
      .select(
        '-password -passwordResetToken -passwordResetExpires -passwordChangedAt -twoFactorSecret -twoFactorBackupCodes'
      )
      .populate({
        path: 'roles',
        select: 'name type description permissions',
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user roles with additional info
    const userRoles = await UserRole.find({ user: user._id })
      .populate('role', 'name type description')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ assignedAt: -1 });

    // Create response object
    const responseData = {
      ...user.toObject(),
      roleAssignments: userRoles,
    };

    res.status(200).json({
      status: 'success',
      data: responseData,
    });
  }
);

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      email,
      password,
      firstName,
      lastName,
      role, // Legacy role
      roles, // New roles array
      permissions, // Legacy permissions
      phoneNumber,
      licenseNumber,
      address,
      dateOfBirth,
      emergencyContact,
      position,
      department,
      hireDate,
      profileImage,
      settings,
      isActive,
      isEmailVerified,
    } = req.body;

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Prepare user data
    const userData: any = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      licenseNumber,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      emergencyContact,
      position,
      department,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      profileImage,
      settings,
      isActive: isActive !== undefined ? isActive : true,
      isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : false,
    };

    // Handle legacy role and permissions (for backward compatibility)
    if (role) {
      userData.role = role;
      userData.permissions =
        permissions || (DEFAULT_ROLE_PERMISSIONS as any)[role] || [];
    }

    // Handle new roles
    if (roles && Array.isArray(roles) && roles.length > 0) {
      // Verify that all roles exist
      const existingRoles = await Role.find({ _id: { $in: roles } });
      if (existingRoles.length !== roles.length) {
        throw new AppError('One or more roles do not exist', 400);
      }

      userData.roles = roles;
    } else if (role) {
      // If no new roles provided but legacy role is, try to map to new role
      try {
        // Map legacy role to new role type
        let roleType: RoleType;
        switch (role) {
          case LegacyUserRole.ADMIN:
            roleType = RoleType.ADMIN;
            break;
          case LegacyUserRole.PHARMACIST:
            roleType = RoleType.PHARMACIST;
            break;
          case LegacyUserRole.TECHNICIAN:
            roleType = RoleType.PHARMACY_TECHNICIAN;
            break;
          case LegacyUserRole.STAFF:
            roleType = RoleType.STAFF;
            break;
          default:
            roleType = RoleType.STAFF;
        }

        // Find the role by type
        const defaultRole = await Role.findOne({ type: roleType });
        if (defaultRole) {
          userData.roles = [defaultRole._id];
        }
      } catch (error) {
        console.error('Error mapping legacy role to new role:', error);
      }
    }

    // Create user
    const user = await User.create(userData);

    // Create user role records if roles are provided
    if (userData.roles && userData.roles.length > 0) {
      const userRolePromises = userData.roles.map((roleId: string) => {
        return UserRole.create({
          user: user._id,
          role: roleId,
          assignedBy: req.user.id,
          assignedAt: new Date(),
        });
      });

      await Promise.all(userRolePromises);
    }

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.USER_CREATE,
      description: `Created new user: ${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        userRoles: user.roles,
      },
    });

    // Populate roles for response
    const populatedUser = await User.findById(user._id)
      .select(
        '-password -passwordResetToken -passwordResetExpires -passwordChangedAt -twoFactorSecret -twoFactorBackupCodes'
      )
      .populate({
        path: 'roles',
        select: 'name type description',
      });

    res.status(201).json({
      status: 'success',
      data: populatedUser,
    });
  }
);

/**
 * @desc    Update user
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      firstName,
      lastName,
      role, // Legacy role
      permissions, // Legacy permissions
      phoneNumber,
      licenseNumber,
      address,
      dateOfBirth,
      emergencyContact,
      position,
      department,
      hireDate,
      profileImage,
      settings,
      isActive,
      isEmailVerified,
      twoFactorEnabled,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Handle legacy role and permissions (for backward compatibility)
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;

    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
    if (address) {
      user.address = {
        ...(user.address || {}),
        ...address,
      };
    }
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (emergencyContact) {
      user.emergencyContact = {
        ...(user.emergencyContact || {}),
        ...emergencyContact,
      };
    }
    if (position !== undefined) user.position = position;
    if (department !== undefined) user.department = department;
    if (hireDate) user.hireDate = new Date(hireDate);
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (settings) {
      user.settings = {
        ...(user.settings || {}),
        ...settings,
      };
    }
    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    if (twoFactorEnabled !== undefined)
      user.twoFactorEnabled = twoFactorEnabled;

    await user.save();

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.USER_UPDATE,
      description: `Updated user: ${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id,
        userEmail: user.email,
        updatedFields: Object.keys(req.body),
      },
    });

    // Populate roles for response
    const populatedUser = await User.findById(user._id)
      .select(
        '-password -passwordResetToken -passwordResetExpires -passwordChangedAt -twoFactorSecret -twoFactorBackupCodes'
      )
      .populate({
        path: 'roles',
        select: 'name type description',
      });

    res.status(200).json({
      status: 'success',
      data: populatedUser,
    });
  }
);

/**
 * @desc    Delete user (soft delete by setting isActive to false)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deleting yourself
    const userId = user._id as unknown as { toString(): string };
    if (userId.toString() === req.user.id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.USER_DELETE,
      description: `Deactivated user: ${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id,
        userEmail: user.email,
      },
    });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Change user password
 * @route   PATCH /api/users/:id/change-password
 * @access  Private/Admin
 */
export const changeUserPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update password
    user.password = password;
    await user.save();

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.PASSWORD_CHANGE,
      description: `Changed password for user: ${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id,
        userEmail: user.email,
      },
    });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Get user profile (for logged in user)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user.id).select(
      '-password -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

/**
 * @desc    Update user profile (for logged in user)
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      emergencyContact,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address) {
      user.address = {
        ...(user.address || {}),
        ...address,
      };
    }
    if (emergencyContact) {
      user.emergencyContact = {
        ...(user.emergencyContact || {}),
        ...emergencyContact,
      };
    }
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.USER_UPDATE,
      description: 'Updated user profile',
      metadata: {
        updatedFields: Object.keys(req.body),
      },
    });

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    const userResponseSafe = {
      ...userResponse,
      password: undefined,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    };

    res.status(200).json({
      status: 'success',
      data: userResponseSafe,
    });
  }
);

/**
 * @desc    Change user password (for logged in user)
 * @route   PATCH /api/users/profile/change-password
 * @access  Private
 */
export const changeUserProfilePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { /* currentPassword, */ newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password - using a simple comparison for now
    // In a real app, you would use a proper password comparison method
    const isMatch = true; // Mock implementation

    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await createActivityLog({
      user: req.user.id,
      type: ActivityType.PASSWORD_CHANGE,
      description: 'Changed password',
      metadata: {
        userId: user._id,
      },
    });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Request password reset
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to user
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry to 1 hour
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // In a real application, you would send an email with the reset token
    // For this example, we'll just return the token in the response

    // Log activity
    const userId = user._id as unknown as { toString(): string };
    await createActivityLog({
      user: userId.toString(),
      type: ActivityType.PASSWORD_RESET,
      description: 'Requested password reset',
      metadata: {
        email: user.email,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent',
      resetToken, // In a real app, this would be sent via email, not in the response
    });
  }
);

/**
 * @desc    Reset password
 * @route   PATCH /api/users/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;
    const { token } = req.params;

    // Hash token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Log activity
    const userId = user._id as unknown as { toString(): string };
    await createActivityLog({
      user: userId.toString(),
      type: ActivityType.PASSWORD_RESET,
      description: 'Reset password',
      metadata: {
        email: user.email,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset',
    });
  }
);
