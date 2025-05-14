import mongoose, { Schema } from 'mongoose';
import { IRole, RoleType, IPermission } from '../interfaces/role.interface';

const permissionSchema = new Schema(
  {
    resource: {
      type: String,
      required: true,
    },
    actions: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      // unique: true, // Removed to avoid duplicate index with explicit index declaration
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(RoleType),
      required: true,
      unique: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [permissionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    parentRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },
    level: {
      type: Number,
      default: 100, // Default to a high number, with 0 being the highest level
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
roleSchema.index({ name: 1 });
roleSchema.index({ type: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isDefault: 1 });
roleSchema.index({ parentRole: 1 });
roleSchema.index({ level: 1 });

// Add methods to the role schema

// Get all permissions including inherited ones from parent roles
roleSchema.methods.getAllPermissions = async function (): Promise<
  IPermission[]
> {
  const role = this;
  const allPermissions = [...role.permissions];

  // If there's a parent role, recursively get its permissions
  if (role.parentRole) {
    const parentRole = await mongoose.model('Role').findById(role.parentRole);
    if (parentRole) {
      const parentPermissions = await parentRole.getAllPermissions();

      // Merge permissions, avoiding duplicates
      parentPermissions.forEach((parentPerm: IPermission) => {
        const exists = allPermissions.some(
          (perm) => perm.resource === parentPerm.resource
        );

        if (!exists) {
          allPermissions.push(parentPerm);
        } else {
          // Merge actions for the same resource
          const existingPerm = allPermissions.find(
            (perm) => perm.resource === parentPerm.resource
          );

          if (existingPerm) {
            parentPerm.actions.forEach((action: string) => {
              if (!existingPerm.actions.includes(action)) {
                existingPerm.actions.push(action);
              }
            });
          }
        }
      });
    }
  }

  return allPermissions;
};

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
