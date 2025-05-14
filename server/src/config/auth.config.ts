import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import env from './env.config';
import { IUser } from '../interfaces/user.interface';

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
  tokenVersion?: number;
  type: 'access' | 'refresh';
}

// Generate access token (short-lived)
export const generateAccessToken = (user: IUser): string => {
  // Create the payload
  const payload: TokenPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion || 0,
    type: 'access',
  };

  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(env.JWT_SECRET, 'utf-8');

  // Create the options with proper typing
  const options: SignOptions = {
    expiresIn: (env.JWT_ACCESS_EXPIRES_IN || '15m') as StringValue, // Short-lived token
  };

  // Sign the token with the Buffer secret
  return jwt.sign(payload, secretKey, options);
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user: IUser): string => {
  // Create the payload
  const payload: TokenPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    tokenVersion: user.tokenVersion || 0,
    type: 'refresh',
  };

  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(
    env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    'utf-8'
  );

  // Create the options with proper typing
  const options: SignOptions = {
    expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue, // Longer-lived token
  };

  // Sign the token with the Buffer secret
  return jwt.sign(payload, secretKey, options);
};

// Generate both tokens
export const generateTokens = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

// Legacy function for backward compatibility
export const generateToken = (user: IUser): string => {
  return generateAccessToken(user);
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(env.JWT_SECRET, 'utf-8');
  return jwt.verify(token, secretKey) as TokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(
    env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    'utf-8'
  );
  return jwt.verify(token, secretKey) as TokenPayload;
};

// Legacy function for backward compatibility
export const verifyToken = (token: string): any => {
  return verifyAccessToken(token);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate a random token
export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

// Generate a password reset token
export const generatePasswordResetToken = (): {
  token: string;
  hashedToken: string;
  expires: Date;
} => {
  const resetToken = generateRandomToken();

  // Hash the token for storage in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry to 1 hour from now
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  return { token: resetToken, hashedToken, expires };
};

// Generate an email verification token
export const generateEmailVerificationToken = (): {
  token: string;
  hashedToken: string;
  expires: Date;
} => {
  const verificationToken = generateRandomToken();

  // Hash the token for storage in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiry to 24 hours from now
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { token: verificationToken, hashedToken, expires };
};

// Validate password strength
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message: string } => {
  // Minimum 8 characters
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: 'Password meets strength requirements' };
};
