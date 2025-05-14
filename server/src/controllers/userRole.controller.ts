import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import Role from '../models/role.model';
import UserRole from '../models/userRole.model';
import { AppError } from '../utils/error';
import { createActivityLog } from './activityLog.controller';
import { ActivityType } from '../interfaces/activityLog.interface';

/**
 * @desc    Get all user roles
 * @route   GET /api/user-roles
 * @access  Private (Admin)
 */
export const getUserRoles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }

  // Filter by role
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Filter by assigned by
  if (req.query.assignedBy) {
    filter.assignedBy = req.query.assignedBy;
  }

  // Execute query with pagination
  const userRoles = await UserRole.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('role', 'name type')
    .populate('assignedBy', 'firstName lastName email')
    .sort({ assignedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await UserRole.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: userRoles,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get user roles for a specific user
 * @route   GET /api/users/:userId/roles
 * @access  Private (Admin)
 */
export const getUserRolesByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user roles
  const userRoles = await UserRole.find({ user: userId })
    .populate('role', 'name type description permissions')
    .populate('assignedBy', 'firstName lastName email')
    .sort({ assignedAt: -1 });

  res.status(200).json({
    status: 'success',
    data: userRoles,
  });
});

/**
 * @desc    Assign role to user
 * @route   POST /api/users/:userId/roles
 * @access  Private (Admin)
 */
export const assignRoleToUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  if (!roleId) {
    throw new AppError('Role ID is required', 400);
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Check if user already has this role
  const existingUserRole = await UserRole.findOne({
    user: userId,
    role: roleId,
  });

  if (existingUserRole) {
    throw new AppError('User already has this role', 400);
  }

  // Create user role
  const userRole = await UserRole.create({
    user: userId,
    role: roleId,
    assignedBy: req.user.id,
    assignedAt: new Date(),
  });

  // Update user's roles array
  if (!user.roles) {
    user.roles = [];
  }
  
  if (!user.roles.includes(roleId)) {
    user.roles.push(roleId);
    await user.save();
  }

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_ASSIGNED,
    description: `Assigned role ${role.name} to user ${user.firstName} ${user.lastName}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
    },
  });

  // Return populated user role
  const populatedUserRole = await UserRole.findById(userRole._id)
    .populate('role', 'name type description')
    .populate('assignedBy', 'firstName lastName email');

  res.status(201).json({
    status: 'success',
    data: populatedUserRole,
  });
});

/**
 * @desc    Remove role from user
 * @route   DELETE /api/users/:userId/roles/:roleId
 * @access  Private (Admin)
 */
export const removeRoleFromUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId, roleId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Find user role
  const userRole = await UserRole.findOne({
    user: userId,
    role: roleId,
  });

  if (!userRole) {
    throw new AppError('User does not have this role', 404);
  }

  // Remove user role
  await userRole.remove();

  // Update user's roles array
  if (user.roles) {
    user.roles = user.roles.filter(
      (r) => r.toString() !== roleId.toString()
    );
    await user.save();
  }

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_REMOVED,
    description: `Removed role ${role.name} from user ${user.firstName} ${user.lastName}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
    },
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Get user permissions
 * @route   GET /api/users/:userId/permissions
 * @access  Private (Admin)
 */
export const getUserPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get effective permissions
  const permissions = await user.getEffectivePermissions();

  res.status(200).json({
    status: 'success',
    data: permissions,
  });
});

/**
 * @desc    Check if user has permission
 * @route   GET /api/users/:userId/permissions/check
 * @access  Private (Admin)
 */
export const checkUserPermission = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { resource, action } = req.query as { resource: string; action: string };

  if (!resource || !action) {
    throw new AppError('Resource and action are required', 400);
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check permission
  const hasPermission = await user.hasPermission(resource, action);

  res.status(200).json({
    status: 'success',
    data: {
      hasPermission,
    },
  });
});
