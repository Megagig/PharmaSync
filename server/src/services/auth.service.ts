import {
  IUser,
  IUserCreate,
  IUserLogin,
  IUserResponse,
  IUserUpdate,
} from '../interfaces/user.interface';
import User from '../models/user.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/error';
import { comparePassword, generateToken, hashPassword } from '../config/auth.config';

export const register = async (userData: IUserCreate): Promise<{ user: IUserResponse; token: string }> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Create new user
  const user = await User.create(userData);
  
  // Generate token
  const token = generateToken(user);
  
  // Return user data and token
  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

export const login = async (credentials: IUserLogin): Promise<{ user: IUserResponse; token: string }> => {
  // Find user by email
  const user = await User.findOne({ email: credentials.email });
  
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account is inactive. Please contact an administrator.');
  }
  
  // Check password
  const isPasswordValid = await comparePassword(credentials.password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate token
  const token = generateToken(user);
  
  // Return user data and token
  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

export const getUserById = async (id: string): Promise<IUserResponse> => {
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    licenseNumber: user.licenseNumber,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateUser = async (id: string, updateData: IUserUpdate): Promise<IUserResponse> => {
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Update user fields
  Object.assign(user, updateData);
  
  // Save updated user
  await user.save();
  
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    licenseNumber: user.licenseNumber,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  
  // Hash new password
  user.password = await hashPassword(newPassword);
  
  // Save updated user
  await user.save();
};
