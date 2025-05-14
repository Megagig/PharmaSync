import mongoose, { Schema } from 'mongoose';
import { IUserRoleDocument } from '../interfaces/role.interface';

const userRoleSchema = new Schema<IUserRoleDocument>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
      // index: true, // Removed to avoid duplicate index with explicit index declaration
    },
    role: {
      type: String,
      ref: 'Role',
      required: true,
    },
    assignedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can have a role only once
userRoleSchema.index({ user: 1, role: 1 }, { unique: true });

// Create indexes for faster queries
userRoleSchema.index({ user: 1 });
userRoleSchema.index({ role: 1 });
userRoleSchema.index({ assignedBy: 1 });
userRoleSchema.index({ assignedAt: -1 });

const UserRole = mongoose.model<IUserRoleDocument>('UserRole', userRoleSchema);

export default UserRole;
