import mongoose, { Schema } from 'mongoose';
import {
  IUser,
  UserRole as UserRoleEnum,
  Permission,
  DEFAULT_ROLE_PERMISSIONS,
  IUserSettings,
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
  },
  {
    timestamps: true,
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

// Method to check if user has a specific permission
userSchema.methods.hasPermission = async function (
  resource: string,
  action: string
): Promise<boolean> {
  // First check legacy permissions (for backward compatibility)
  if (this.permissions && this.permissions.length > 0) {
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
    for (const permission of this.permissions) {
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

  // Then check new role-based permissions
  if (!this.roles || this.roles.length === 0) {
    return false;
  }

  // Get all roles for this user
  const userRoles = await Role.find({ _id: { $in: this.roles } });

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
  const userRoles = await Role.find({ _id: { $in: this.roles } });

  // Check if any role matches the requested type
  return userRoles.some((role) => role.type === roleType);
};

// Method to get all effective permissions for this user
userSchema.methods.getEffectivePermissions = async function (): Promise<
  IPermission[]
> {
  const effectivePermissions: IPermission[] = [];

  // First add legacy permissions (for backward compatibility)
  if (this.permissions && this.permissions.length > 0) {
    // Map old permission format to new format
    const legacyPermissionMap: Record<string, IPermission> = {
      view_patients: { resource: 'patients', actions: ['read'] },
      create_patients: { resource: 'patients', actions: ['create'] },
      edit_patients: { resource: 'patients', actions: ['update'] },
      // Add more mappings as needed
    };

    for (const permission of this.permissions) {
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

  // Then add role-based permissions
  if (this.roles && this.roles.length > 0) {
    // Get all roles for this user
    const userRoles = await Role.find({ _id: { $in: this.roles } });

    // Add permissions from each role
    for (const role of userRoles) {
      for (const permission of role.permissions) {
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Set default permissions based on role if permissions array is empty or role has changed
  // (Legacy support)
  if (
    this.isNew ||
    this.isModified('role') ||
    (this.permissions && this.permissions.length === 0)
  ) {
    const role = this.role as UserRoleEnum;
    // Handle the case for PATIENT role which might not be in DEFAULT_ROLE_PERMISSIONS
    if (role === UserRoleEnum.PATIENT) {
      this.permissions = [];
    } else {
      this.permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    }
  }

  // If this is a new user and no roles are assigned, assign a default role based on the legacy role
  if (this.isNew && (!this.roles || this.roles.length === 0) && this.role) {
    try {
      // Find the corresponding new role type
      let roleType: RoleType;
      switch (this.role) {
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
        this.roles = [(role._id as any).toString()];
      }
    } catch (error) {
      console.error('Error assigning default role:', error);
    }
  }

  // Hash password if it has been modified
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);

      // Update passwordChangedAt field
      this.passwordChangedAt = new Date();
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
