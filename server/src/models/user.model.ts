import mongoose, { Schema } from 'mongoose';
import {
  IUser,
  UserRole,
  Permission,
  DEFAULT_ROLE_PERMISSIONS,
} from '../interfaces/user.interface';
import { hashPassword } from '../config/auth.config';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STAFF,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
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
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Set default permissions based on role if permissions array is empty or role has changed
  if (
    this.isNew ||
    this.isModified('role') ||
    (this.permissions && this.permissions.length === 0)
  ) {
    const role = this.role as UserRole;
    this.permissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  // Hash password if it has been modified
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
