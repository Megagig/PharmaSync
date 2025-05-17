import mongoose, { Schema } from 'mongoose';
import {
  IUser,
  UserRole as UserRoleEnum,
  Permission,
  DEFAULT_ROLE_PERMISSIONS,
  IUserSettings,
  ApprovalStatus,
} from '../interfaces/user.interface';
import { RoleType, IPermission } from '../interfaces/role.interface';
import { hashPassword } from '../config/auth.config';
import Role from './role.model';
import UserRoleModel from './userRole.model';

const userSettingsSchema = new Schema<IUserSettings>(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    dashboard: {
      widgets: {
        type: [String],
        default: [],
      },
      layout: {
        type: Schema.Types.Mixed,
      },
    },
  },
  { _id: false }
);

const securityEventSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    // Legacy role field (will be deprecated)
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.STAFF,
    },
    // Legacy permissions field (will be deprecated)
    permissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
    // New roles field (array of role IDs)
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    phoneNumber: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'Nigeria',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    hireDate: {
      type: Date,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    settings: userSettingsSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    approvedBy: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    twoFactorBackupCodes: {
      type: [String],
    },
    // Token management
    tokenVersion: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },
    // Security and audit
    lastPasswordChange: {
      type: Date,
    },
    lastIpAddress: {
      type: String,
    },
    lastUserAgent: {
      type: String,
    },
    securityEvents: [securityEventSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Create indexes for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.state': 1 });
userSchema.index({ 'address.country': 1 });
userSchema.index({ department: 1 });
userSchema.index({ position: 1 });
userSchema.index({ tokenVersion: 1 });
userSchema.index({ refreshTokenExpires: 1 });

// Method to check if user has a specific permission
userSchema.methods.hasPermission = async function (
  resource: string,
  action: string
): Promise<boolean> {
  // First check legacy permissions (for backward compatibility)
  if (this.permissions && this.permissions.length > 0) {
    // Check if any permission is a legacy string permission
    const legacyPermissions = this.permissions.filter(
      (p): p is string => typeof p === 'string'
    );
    if (legacyPermissions.length > 0) {
      // Map old permission format to new format for checking
      const legacyPermissionMap: Record<
        string,
        { resource: string; action: string }
      > = {
        view_patients: { resource: 'patients', action: 'read' },
        create_patients: { resource: 'patients', action: 'create' },
        edit_patients: { resource: 'patients', action: 'update' },
        view_medications: { resource: 'medications', action: 'read' },
        create_medications: { resource: 'medications', action: 'create' },
        edit_medications: { resource: 'medications', action: 'update' },
        // Add more mappings as needed
      };

      // Check if any legacy permission maps to the requested permission
      for (const permission of legacyPermissions) {
        const mapping = legacyPermissionMap[permission];
        if (
          mapping &&
          mapping.resource === resource &&
          mapping.action === action
        ) {
          return true;
        }
      }
    }

    // Check if any permission is an IPermission object
    const objectPermissions = this.permissions.filter(
      (p): p is IPermission => typeof p === 'object' && p !== null
    );
    if (objectPermissions.length > 0) {
      // Check for the 'manage' action which grants full access to the resource
      const hasManagePermission = objectPermissions.some(
        (p) => p.resource === resource && p.actions.includes('manage')
      );

      if (hasManagePermission) {
        return true;
      }

      // Check for the specific action
      const hasSpecificPermission = objectPermissions.some(
        (p) => p.resource === resource && p.actions.includes(action)
      );

      if (hasSpecificPermission) {
        return true;
      }
    }
  }

  // Then check new role-based permissions
  if (!this.roles || this.roles.length === 0) {
    return false;
  }

  // Get all roles for this user
  const userRoles = await Role.find({
    _id: { $in: this.roles },
    isActive: true,
  });

  // Check if any role has the required permission
  for (const role of userRoles) {
    // Check for the 'manage' action which grants full access to the resource
    const hasManagePermission = role.permissions.some(
      (p) => p.resource === resource && p.actions.includes('manage')
    );

    if (hasManagePermission) {
      return true;
    }

    // Check for the specific action
    const hasSpecificPermission = role.permissions.some(
      (p) => p.resource === resource && p.actions.includes(action)
    );

    if (hasSpecificPermission) {
      return true;
    }

    // Check inherited permissions from parent roles
    try {
      const allPermissions = await role.getAllPermissions();

      // Check for the 'manage' action in inherited permissions
      const hasInheritedManagePermission = allPermissions.some(
        (p: IPermission) =>
          p.resource === resource && p.actions.includes('manage')
      );

      if (hasInheritedManagePermission) {
        return true;
      }

      // Check for the specific action in inherited permissions
      const hasInheritedSpecificPermission = allPermissions.some(
        (p: IPermission) =>
          p.resource === resource && p.actions.includes(action)
      );

      if (hasInheritedSpecificPermission) {
        return true;
      }
    } catch (error) {
      console.error('Error checking inherited permissions:', error);
    }
  }

  return false;
};

// Method to check if user has a specific role
userSchema.methods.hasRole = async function (
  roleType: RoleType
): Promise<boolean> {
  if (!this.roles || this.roles.length === 0) {
    return false;
  }

  // Get all roles for this user
  const userRoles = await Role.find({
    _id: { $in: this.roles },
    isActive: true,
  });

  // Check if any role matches the requested type
  const directMatch = userRoles.some((role) => role.type === roleType);

  if (directMatch) {
    return true;
  }

  // Check for role hierarchy - if the user has a higher-level role that includes this role
  // Get the requested role to check its level
  const requestedRole = await Role.findOne({ type: roleType });

  if (!requestedRole) {
    return false;
  }

  // Check if any of the user's roles has a lower level number (higher privilege)
  // than the requested role and is in the same hierarchy branch
  for (const role of userRoles) {
    // Lower level number means higher privilege in the hierarchy
    if (role.level < requestedRole.level) {
      // Check if this higher role is in the same branch by traversing the hierarchy
      let currentRole = requestedRole;
      let isInSameBranch = false;

      // Traverse up the hierarchy until we find a match or reach the top
      while (currentRole.parentRole) {
        const parentRole = await Role.findById(currentRole.parentRole);

        if (!parentRole) {
          break;
        }

        if (
          parentRole._id &&
          role._id &&
          parentRole._id.toString() === role._id.toString()
        ) {
          isInSameBranch = true;
          break;
        }

        currentRole = parentRole;
      }

      if (isInSameBranch) {
        return true;
      }
    }
  }

  return false;
};

// Method to get all effective permissions for this user
userSchema.methods.getEffectivePermissions = async function (): Promise<
  IPermission[]
> {
  const effectivePermissions: IPermission[] = [];

  // First add legacy permissions (for backward compatibility)
  if (this.permissions && this.permissions.length > 0) {
    // Handle legacy string permissions
    const legacyPermissions = this.permissions.filter(
      (p): p is string => typeof p === 'string'
    );
    if (legacyPermissions.length > 0) {
      // Map old permission format to new format
      const legacyPermissionMap: Record<string, IPermission> = {
        view_patients: { resource: 'patients', actions: ['read'] },
        create_patients: { resource: 'patients', actions: ['create'] },
        edit_patients: { resource: 'patients', actions: ['update'] },
        view_medications: { resource: 'medications', actions: ['read'] },
        create_medications: { resource: 'medications', actions: ['create'] },
        edit_medications: { resource: 'medications', actions: ['update'] },
        view_prescriptions: { resource: 'prescriptions', actions: ['read'] },
        create_prescriptions: {
          resource: 'prescriptions',
          actions: ['create'],
        },
        edit_prescriptions: { resource: 'prescriptions', actions: ['update'] },
        view_dispensing: { resource: 'dispensings', actions: ['read'] },
        create_dispensing: { resource: 'dispensings', actions: ['create'] },
        edit_dispensing: { resource: 'dispensings', actions: ['update'] },
        view_inventory: { resource: 'inventory', actions: ['read'] },
        manage_inventory: { resource: 'inventory', actions: ['manage'] },
        view_suppliers: { resource: 'suppliers', actions: ['read'] },
        manage_suppliers: { resource: 'suppliers', actions: ['manage'] },
        view_purchase_orders: {
          resource: 'purchase_orders',
          actions: ['read'],
        },
        create_purchase_orders: {
          resource: 'purchase_orders',
          actions: ['create'],
        },
        edit_purchase_orders: {
          resource: 'purchase_orders',
          actions: ['update'],
        },
        view_reports: { resource: 'reports', actions: ['read'] },
        view_schedule: { resource: 'schedule', actions: ['read'] },
        // Add more mappings as needed
      };

      for (const permission of legacyPermissions) {
        const mapping = legacyPermissionMap[permission];
        if (mapping) {
          // Check if we already have this resource in our effective permissions
          const existingPermission = effectivePermissions.find(
            (p) => p.resource === mapping.resource
          );
          if (existingPermission) {
            // Add actions that don't already exist
            for (const action of mapping.actions) {
              if (!existingPermission.actions.includes(action)) {
                existingPermission.actions.push(action);
              }
            }
          } else {
            // Add new permission
            effectivePermissions.push({
              resource: mapping.resource,
              actions: [...mapping.actions],
            });
          }
        }
      }
    }

    // Handle IPermission objects
    const objectPermissions = this.permissions.filter(
      (p): p is IPermission => typeof p === 'object' && p !== null
    );
    if (objectPermissions.length > 0) {
      for (const permission of objectPermissions) {
        const existingPermission = effectivePermissions.find(
          (p) => p.resource === permission.resource
        );
        if (existingPermission) {
          // Add actions that don't already exist
          for (const action of permission.actions) {
            if (!existingPermission.actions.includes(action)) {
              existingPermission.actions.push(action);
            }
          }
        } else {
          // Add new permission
          effectivePermissions.push({
            resource: permission.resource,
            actions: [...permission.actions],
          });
        }
      }
    }
  }

  // Then add role-based permissions
  if (this.roles && this.roles.length > 0) {
    // Get all roles for this user
    const userRoles = await Role.find({
      _id: { $in: this.roles },
      isActive: true,
    });

    // Add permissions from each role
    for (const role of userRoles) {
      // Get direct permissions
      const directPermissions = role.permissions;

      // Get inherited permissions
      let allPermissions: IPermission[] = directPermissions;
      try {
        allPermissions = await role.getAllPermissions();
      } catch (error) {
        console.error('Error getting all permissions:', error);
      }

      // Add all permissions to effective permissions
      for (const permission of allPermissions) {
        // Check if we already have this resource in our effective permissions
        const existingPermission = effectivePermissions.find(
          (p) => p.resource === permission.resource
        );
        if (existingPermission) {
          // Add actions that don't already exist
          for (const action of permission.actions) {
            if (!existingPermission.actions.includes(action)) {
              existingPermission.actions.push(action);
            }
          }
        } else {
          // Add new permission
          effectivePermissions.push({
            resource: permission.resource,
            actions: [...permission.actions],
          });
        }
      }
    }
  }

  return effectivePermissions;
};

// Method to invalidate all tokens for this user
userSchema.methods.invalidateTokens = async function (): Promise<void> {
  // Type assertion to access properties
  const user = this as any;

  // Increment token version to invalidate all existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  // Clear any stored refresh token
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  // Add security event
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'token_invalidation',
    timestamp: new Date(),
    details: 'All tokens invalidated',
  });

  // Save the user
  await user.save();
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Type assertion to access properties
  const user = this as any;

  // Set default permissions based on role if permissions array is empty or role has changed
  // (Legacy support)
  if (
    user.isNew ||
    user.isModified('role') ||
    (user.permissions && user.permissions.length === 0)
  ) {
    const role = user.role as UserRoleEnum;
    // Handle the case for PATIENT role which might not be in DEFAULT_ROLE_PERMISSIONS
    if (role === UserRoleEnum.PATIENT) {
      user.permissions = [];
    } else {
      user.permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    }
  }

  // If this is a new user and no roles are assigned, assign a default role based on the legacy role
  if (user.isNew && (!user.roles || user.roles.length === 0) && user.role) {
    try {
      // Find the corresponding new role type
      let roleType: RoleType;
      switch (user.role) {
        case UserRoleEnum.ADMIN:
          roleType = RoleType.ADMIN;
          break;
        case UserRoleEnum.PHARMACIST:
          roleType = RoleType.PHARMACIST;
          break;
        case UserRoleEnum.TECHNICIAN:
          roleType = RoleType.PHARMACY_TECHNICIAN;
          break;
        case UserRoleEnum.STAFF:
          roleType = RoleType.STAFF;
          break;
        case UserRoleEnum.PATIENT:
          roleType = RoleType.PATIENT;
          break;
        default:
          roleType = RoleType.STAFF;
      }

      // Find the role by type
      const role = await Role.findOne({ type: roleType });
      if (role && role._id) {
        // Use type assertion to handle the unknown type
        user.roles = [(role._id as any).toString()];
      }
    } catch (error) {
      console.error('Error assigning default role:', error);
    }
  }

  // Hash password if it has been modified
  if (user.isModified('password')) {
    try {
      user.password = await hashPassword(user.password);

      // Update passwordChangedAt field
      user.passwordChangedAt = new Date();
      user.lastPasswordChange = new Date();

      // Increment token version to invalidate all existing tokens
      user.tokenVersion = (user.tokenVersion || 0) + 1;

      // Add security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'password_change',
        timestamp: new Date(),
        details: 'Password changed',
      });
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
