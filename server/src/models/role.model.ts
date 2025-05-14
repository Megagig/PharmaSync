import mongoose, { Schema } from 'mongoose';
import { IRole, RoleType } from '../interfaces/role.interface';

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
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(RoleType),
      required: true,
      unique: true,
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

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
