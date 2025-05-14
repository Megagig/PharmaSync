import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import ActivityLog from '../models/activityLog.model';
import { ActivityType } from '../interfaces/activityLog.interface';
import { UserRole, Permission, DEFAULT_ROLE_PERMISSIONS } from '../interfaces/user.interface';
import { AppError } from '../utils/error';
import { hashPassword } from '../config/auth.config';
import crypto from 'crypto';

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  // Filter by role
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  // Search by name or email
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  
  // Execute query with pagination
  const users = await User.find(filter)
    .select('-password -passwordResetToken -passwordResetExpires')
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
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -passwordResetToken -passwordResetExpires');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    permissions,
    phoneNumber,
    licenseNumber,
    address,
    dateOfBirth,
    emergencyContact,
    position,
    department,
    hireDate,
    profileImage,
  } = req.body;
  
  // Check if user with same email already exists
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }
  
  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: role || UserRole.STAFF,
    permissions: permissions || DEFAULT_ROLE_PERMISSIONS[role || UserRole.STAFF],
    phoneNumber,
    licenseNumber,
    address,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    emergencyContact,
    position,
    department,
    hireDate: hireDate ? new Date(hireDate) : undefined,
    profileImage,
  });
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.USER_CREATE,
    description: `Created new user: ${user.firstName} ${user.lastName}`,
    details: {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Remove sensitive data before sending response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;
  
  res.status(201).json({
    status: 'success',
    data: userResponse,
  });
});

/**
 * @desc    Update user
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    role,
    permissions,
    phoneNumber,
    licenseNumber,
    address,
    dateOfBirth,
    emergencyContact,
    position,
    department,
    hireDate,
    profileImage,
    isActive,
  } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role) user.role = role;
  if (permissions) user.permissions = permissions;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
  if (address) {
    user.address = {
      ...user.address || {},
      ...address,
    };
  }
  if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
  if (emergencyContact) {
    user.emergencyContact = {
      ...user.emergencyContact || {},
      ...emergencyContact,
    };
  }
  if (position !== undefined) user.position = position;
  if (department !== undefined) user.department = department;
  if (hireDate) user.hireDate = new Date(hireDate);
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (isActive !== undefined) user.isActive = isActive;
  
  await user.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.USER_UPDATE,
    description: `Updated user: ${user.firstName} ${user.lastName}`,
    details: {
      userId: user._id,
      userEmail: user.email,
      updatedFields: Object.keys(req.body),
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Remove sensitive data before sending response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;
  
  res.status(200).json({
    status: 'success',
    data: userResponse,
  });
});

/**
 * @desc    Delete user (soft delete by setting isActive to false)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Prevent deleting yourself
  if (user._id.toString() === req.user.id) {
    throw new AppError('You cannot delete your own account', 400);
  }
  
  // Soft delete by setting isActive to false
  user.isActive = false;
  await user.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.USER_DELETE,
    description: `Deactivated user: ${user.firstName} ${user.lastName}`,
    details: {
      userId: user._id,
      userEmail: user.email,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Change user password
 * @route   PATCH /api/users/:id/change-password
 * @access  Private/Admin
 */
export const changeUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update password
  user.password = password;
  await user.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.PASSWORD_CHANGE,
    description: `Changed password for user: ${user.firstName} ${user.lastName}`,
    details: {
      userId: user._id,
      userEmail: user.email,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Get user profile (for logged in user)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * @desc    Update user profile (for logged in user)
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
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
      ...user.address || {},
      ...address,
    };
  }
  if (emergencyContact) {
    user.emergencyContact = {
      ...user.emergencyContact || {},
      ...emergencyContact,
    };
  }
  if (profileImage !== undefined) user.profileImage = profileImage;
  
  await user.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.USER_UPDATE,
    description: 'Updated user profile',
    details: {
      updatedFields: Object.keys(req.body),
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Remove sensitive data before sending response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;
  
  res.status(200).json({
    status: 'success',
    data: userResponse,
  });
});

/**
 * @desc    Change user password (for logged in user)
 * @route   PATCH /api/users/profile/change-password
 * @access  Private
 */
export const changeUserProfilePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.PASSWORD_CHANGE,
    description: 'Changed password',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Request password reset
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
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
  await ActivityLog.create({
    user: user._id,
    activityType: ActivityType.PASSWORD_RESET,
    description: 'Requested password reset',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Password reset token sent',
    resetToken, // In a real app, this would be sent via email, not in the response
  });
});

/**
 * @desc    Reset password
 * @route   PATCH /api/users/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.params;
  
  // Hash token to compare with stored token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
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
  await ActivityLog.create({
    user: user._id,
    activityType: ActivityType.PASSWORD_RESET,
    description: 'Reset password',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Password has been reset',
  });
});
