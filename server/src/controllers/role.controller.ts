import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Role from '../models/role.model';
import UserRole from '../models/userRole.model';
import User from '../models/user.model';
import { AppError } from '../utils/error';
import { RoleType, DEFAULT_ROLE_PERMISSIONS } from '../interfaces/role.interface';
import { createActivityLog } from './activityLog.controller';
import { ActivityType } from '../interfaces/activityLog.interface';

/**
 * @desc    Get all roles
 * @route   GET /api/roles
 * @access  Private (Admin)
 */
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Filter by default status
  if (req.query.isDefault !== undefined) {
    filter.isDefault = req.query.isDefault === 'true';
  }

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by name (partial match)
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: 'i' };
  }

  // Execute query with pagination
  const roles = await Role.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Role.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: roles,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get role by ID
 * @route   GET /api/roles/:id
 * @access  Private (Admin)
 */
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: role,
  });
});

/**
 * @desc    Create a new role
 * @route   POST /api/roles
 * @access  Private (Admin)
 */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, description, permissions, isActive, isDefault } = req.body;

  // Check if role with this type already exists
  const existingRole = await Role.findOne({ type });
  if (existingRole) {
    throw new AppError(`Role with type '${type}' already exists`, 400);
  }

  // Create new role
  const role = await Role.create({
    name,
    type,
    description,
    permissions,
    isActive: isActive !== undefined ? isActive : true,
    isDefault: isDefault !== undefined ? isDefault : false,
  });

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_CREATED,
    description: `Created role: ${name}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleType: role.type,
    },
  });

  res.status(201).json({
    status: 'success',
    data: role,
  });
});

/**
 * @desc    Update a role
 * @route   PATCH /api/roles/:id
 * @access  Private (Admin)
 */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, permissions, isActive, isDefault } = req.body;

  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Update fields
  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;
  if (isActive !== undefined) role.isActive = isActive;
  if (isDefault !== undefined) role.isDefault = isDefault;

  // Save changes
  await role.save();

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_UPDATED,
    description: `Updated role: ${role.name}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleType: role.type,
      changes: req.body,
    },
  });

  res.status(200).json({
    status: 'success',
    data: role,
  });
});

/**
 * @desc    Delete a role
 * @route   DELETE /api/roles/:id
 * @access  Private (Admin)
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Check if role is in use
  const userRoleCount = await UserRole.countDocuments({ role: role._id });
  if (userRoleCount > 0) {
    throw new AppError(
      `Cannot delete role that is assigned to ${userRoleCount} users`,
      400
    );
  }

  // Delete role
  await role.remove();

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_DELETED,
    description: `Deleted role: ${role.name}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleType: role.type,
    },
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Reset a role to default permissions
 * @route   POST /api/roles/:id/reset
 * @access  Private (Admin)
 */
export const resetRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Get default permissions for this role type
  const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role.type as RoleType];
  
  if (!defaultPermissions) {
    throw new AppError(`No default permissions found for role type: ${role.type}`, 400);
  }

  // Update permissions
  role.permissions = defaultPermissions;
  await role.save();

  // Log activity
  await createActivityLog({
    user: req.user.id,
    type: ActivityType.ROLE_UPDATED,
    description: `Reset permissions for role: ${role.name}`,
    metadata: {
      roleId: role._id,
      roleName: role.name,
      roleType: role.type,
    },
  });

  res.status(200).json({
    status: 'success',
    data: role,
  });
});

/**
 * @desc    Get users with a specific role
 * @route   GET /api/roles/:id/users
 * @access  Private (Admin)
 */
export const getRoleUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Find user roles
  const userRoles = await UserRole.find({ role: role._id })
    .populate('user', 'firstName lastName email isActive')
    .sort({ assignedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await UserRole.countDocuments({ role: role._id });

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
 * @desc    Assign role to user
 * @route   POST /api/roles/:id/assign
 * @access  Private (Admin)
 */
export const assignRoleToUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user already has this role
  const existingUserRole = await UserRole.findOne({
    user: userId,
    role: role._id,
  });

  if (existingUserRole) {
    throw new AppError('User already has this role', 400);
  }

  // Create user role
  const userRole = await UserRole.create({
    user: userId,
    role: role._id,
    assignedBy: req.user.id,
    assignedAt: new Date(),
  });

  // Update user's roles array
  if (!user.roles) {
    user.roles = [];
  }
  
  if (!user.roles.includes(role._id)) {
    user.roles.push(role._id);
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

  res.status(201).json({
    status: 'success',
    data: userRole,
  });
});

/**
 * @desc    Remove role from user
 * @route   DELETE /api/roles/:id/users/:userId
 * @access  Private (Admin)
 */
export const removeRoleFromUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Find role
  const role = await Role.findById(req.params.id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Find user role
  const userRole = await UserRole.findOne({
    user: userId,
    role: role._id,
  });

  if (!userRole) {
    throw new AppError('User does not have this role', 404);
  }

  // Remove user role
  await userRole.remove();

  // Update user's roles array
  if (user.roles) {
    user.roles = user.roles.filter(
      (r) => r.toString() !== role._id.toString()
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
