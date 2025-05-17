import {
  IUser,
  IUserCreate,
  IUserLogin,
  IUserResponse,
  IUserUpdate,
  ApprovalStatus,
} from '../interfaces/user.interface';
import User from '../models/user.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/error';
import {
  comparePassword,
  generateToken,
  hashPassword as hashPasswordUtil,
  generateTokens,
  verifyRefreshToken,
  validatePasswordStrength,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../config/auth.config';
import * as emailService from './email.service';
import crypto from 'crypto';
import config from '../config';

// Export hashPassword function for use in other modules
export const hashPassword = hashPasswordUtil;

export const register = async (
  userData: IUserCreate,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(passwordValidation.message);
  }

  // Generate email verification token
  const { token, hashedToken, expires } = generateEmailVerificationToken();

  // Prepare user data with verification token
  const userDataWithVerification = {
    ...userData,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires,
    isEmailVerified: false,
    tokenVersion: 0,
    lastIpAddress: ipAddress,
    lastUserAgent: userAgent,
    // Set approval status to PENDING by default
    approvalStatus: ApprovalStatus.PENDING,
    // Set isActive to false until approved
    isActive: false,
    securityEvents: [
      {
        type: 'account_created',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: 'Account created',
      },
    ],
  };

  // Create new user
  const user = await User.create(userDataWithVerification);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store hashed refresh token in the database
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await user.save();

  // Send registration confirmation email
  try {
    await emailService.sendRegistrationConfirmationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`
    );
  } catch (error) {
    console.error('Failed to send registration confirmation email:', error);
    // Don't throw error, continue with registration process
  }

  // Return user data and tokens
  return {
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      approvalStatus: user.approvalStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async (
  credentials: IUserLogin,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}> => {
  // Find user by email
  const user = await User.findOne({ email: credentials.email });

  if (!user) {
    // Record failed login attempt for security monitoring
    // This could be stored in a separate collection for security analytics
    console.warn(
      `Failed login attempt for non-existent user: ${credentials.email}`
    );
    throw new UnauthorizedError('Invalid email or password. Please try again.');
  }

  // Log user details for debugging
  console.log(`Login attempt for user: ${credentials.email}`);
  console.log(`User exists: ${!!user}`);
  console.log(`User ID: ${user._id}`);
  console.log(`User role: ${user.role}`);
  console.log(`User approval status: ${user.approvalStatus}`);
  console.log(`User is active: ${user.isActive}`);

  // Check if user is active
  if (!user.isActive) {
    // Record security event
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'login_attempt_inactive',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Login attempt on inactive account',
    });

    await user.save();

    throw new UnauthorizedError(
      'Your account is inactive. Please contact an administrator.'
    );
  }

  // Check if user account is pending approval
  if (user.approvalStatus === ApprovalStatus.PENDING) {
    // Record security event
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'login_attempt_pending_approval',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Login attempt on account pending approval',
    });

    await user.save();

    throw new UnauthorizedError(
      'Your account is pending approval. Please wait for an administrator to approve your account.'
    );
  }

  // Check if user account is rejected
  if (user.approvalStatus === ApprovalStatus.REJECTED) {
    // Record security event
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'login_attempt_rejected',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Login attempt on rejected account',
    });

    await user.save();

    throw new UnauthorizedError(
      'Your account registration has been rejected. Please contact support for more information.'
    );
  }

  // Check if account is locked due to too many failed attempts
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    // Record security event
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'login_attempt_locked',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Login attempt on locked account',
    });

    await user.save();

    const minutesLeft = Math.ceil(
      (user.lockoutUntil.getTime() - Date.now()) / (60 * 1000)
    );

    throw new UnauthorizedError(
      `Account is temporarily locked. Please try again in ${minutesLeft} minutes.`
    );
  }

  // Check password
  console.log(`Checking password for user: ${user.email}`);
  console.log(
    `Stored hashed password: ${user.password ? 'exists' : 'missing'}`
  );

  try {
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );

    console.log(
      `Password validation result: ${isPasswordValid ? 'valid' : 'invalid'}`
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      console.log(`Failed login attempts: ${user.failedLoginAttempts}`);

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        // Lock for 15 minutes
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);

        // Record security event
        if (!user.securityEvents) {
          user.securityEvents = [];
        }

        user.securityEvents.push({
          type: 'account_locked',
          timestamp: new Date(),
          ipAddress,
          userAgent,
          details: 'Account locked due to too many failed login attempts',
        });
      } else {
        // Record failed login attempt
        if (!user.securityEvents) {
          user.securityEvents = [];
        }

        user.securityEvents.push({
          type: 'login_failed',
          timestamp: new Date(),
          ipAddress,
          userAgent,
          details: `Failed login attempt (${user.failedLoginAttempts}/5)`,
        });
      }

      await user.save();
      throw new UnauthorizedError(
        'Invalid email or password. Please try again.'
      );
    }
  } catch (error) {
    console.error('Error during password validation:', error);
    throw error;
  }

  // Check if two-factor authentication is enabled
  if (user.twoFactorEnabled) {
    // If 2FA is enabled but no code was provided
    if (!credentials.twoFactorCode) {
      // Record security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'login_2fa_required',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: '2FA code required but not provided',
      });

      await user.save();

      // Return a special response indicating 2FA is required
      throw new UnauthorizedError('Two-factor authentication code required', {
        requiresTwoFactor: true,
      });
    }

    // Verify 2FA code
    // This would use a library like speakeasy to verify the code
    // For now, we'll just simulate it
    const isTwoFactorValid = credentials.twoFactorCode === '123456'; // Replace with actual verification

    if (!isTwoFactorValid) {
      // Record security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'login_2fa_failed',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: 'Invalid 2FA code provided',
      });

      await user.save();

      throw new UnauthorizedError('Invalid two-factor authentication code');
    }
  }

  // Reset failed login attempts
  user.failedLoginAttempts = 0;
  user.lockoutUntil = undefined;

  // Update last login info
  user.lastLogin = new Date();
  user.lastIpAddress = ipAddress;
  user.lastUserAgent = userAgent;

  // Record successful login
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'login_success',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'Successful login',
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store hashed refresh token in the database
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await user.save();

  // Return user data and tokens
  return {
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      approvalStatus: user.approvalStatus,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const getUserById = async (id: string): Promise<IUserResponse> => {
  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    licenseNumber: user.licenseNumber,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    approvalStatus: user.approvalStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateUser = async (
  id: string,
  updateData: IUserUpdate
): Promise<IUserResponse> => {
  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update user fields
  Object.assign(user, updateData);

  // Save updated user
  await user.save();

  return {
    id: (user._id as any).toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    licenseNumber: user.licenseNumber,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    approvalStatus: user.approvalStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const forgotPassword = async (
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  // Find user by email
  const user = await User.findOne({ email });

  // If no user found, still return success to prevent email enumeration
  if (!user) {
    console.warn(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  // Check if user is active
  if (!user.isActive) {
    // Record security event but don't inform the requester
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'password_reset_inactive',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Password reset requested for inactive account',
    });

    await user.save();
    return;
  }

  // Generate password reset token
  const { token, hashedToken, expires } = generatePasswordResetToken();

  // Save token to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expires;

  // Record password reset request
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'password_reset_requested',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'Password reset requested',
  });

  await user.save();

  // Send password reset email
  try {
    const resetUrl = `${config.clientUrl}/reset-password/${token}`;
    await emailService.sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetUrl
    );
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Don't throw error, continue with password reset process
  }
};

export const verifyPasswordResetToken = async (
  token: string
): Promise<boolean> => {
  // Hash the token from the URL
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with this token that hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  return true;
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  // Hash the token from the URL
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with this token that hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(passwordValidation.message);
  }

  // Update password
  user.password = await hashPassword(newPassword);

  // Clear reset token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Update password change timestamps
  user.passwordChangedAt = new Date();
  user.lastPasswordChange = new Date();

  // Increment token version to invalidate all existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  // Clear refresh token
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  // Record password reset
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'password_reset',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'Password reset successfully',
  });

  await user.save();
};

export const verifyEmail = async (
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  // Hash the token from the URL
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with this token that hasn't expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
    isEmailVerified: false,
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired email verification token');
  }

  // Mark email as verified
  user.isEmailVerified = true;

  // Clear verification token
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // Record email verification
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'email_verified',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'Email address verified',
  });

  await user.save();
};

export const refreshAccessToken = async (
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if it's actually a refresh token
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Find the user
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Check token version
    if (user.tokenVersion !== decoded.tokenVersion) {
      // Record security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'token_version_mismatch',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: 'Attempted to use a refresh token with an invalid version',
      });

      await user.save();

      throw new UnauthorizedError('Token has been revoked');
    }

    // Verify the stored refresh token
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    if (user.refreshToken !== hashedRefreshToken) {
      // Record security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'invalid_refresh_token',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: 'Attempted to use an invalid refresh token',
      });

      await user.save();

      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      // Record security event
      if (!user.securityEvents) {
        user.securityEvents = [];
      }

      user.securityEvents.push({
        type: 'expired_refresh_token',
        timestamp: new Date(),
        ipAddress,
        userAgent,
        details: 'Attempted to use an expired refresh token',
      });

      await user.save();

      throw new UnauthorizedError('Refresh token expired');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Store new refresh token
    const newHashedRefreshToken = crypto
      .createHash('sha256')
      .update(tokens.refreshToken)
      .digest('hex');

    user.refreshToken = newHashedRefreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Record token refresh
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'token_refreshed',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Access token refreshed',
    });

    await user.save();

    return tokens;
  } catch (error: any) {
    if (error && error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }

    if (error && error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }

    throw error;
  }
};

export const logout = async (
  userId: string,
  refreshToken?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    return; // Silently fail if user not found
  }

  // Clear refresh token
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  // Record logout
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'logout',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'User logged out',
  });

  await user.save();
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    // Record failed password change attempt
    if (!user.securityEvents) {
      user.securityEvents = [];
    }

    user.securityEvents.push({
      type: 'password_change_failed',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: 'Failed password change attempt - incorrect current password',
    });

    await user.save();

    throw new UnauthorizedError('Current password is incorrect');
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(passwordValidation.message);
  }

  // Hash new password
  user.password = await hashPassword(newPassword);

  // Update password change timestamps
  user.passwordChangedAt = new Date();
  user.lastPasswordChange = new Date();

  // Increment token version to invalidate all existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  // Clear refresh token
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  // Record password change
  if (!user.securityEvents) {
    user.securityEvents = [];
  }

  user.securityEvents.push({
    type: 'password_changed',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details: 'Password changed successfully',
  });

  // Save updated user
  await user.save();
};
