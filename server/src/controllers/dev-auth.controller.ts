import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import env from '../config/env.config';

/**
 * Development-only authentication controller with simplified logic
 * This controller bypasses many security checks for easier development
 */

// Create a test user for development
const createTestUser = async () => {
  try {
    // Check if test user exists
    const testUser = await User.findOne({ email: 'admin@example.com' });
    if (!testUser) {
      // Create test user with admin role
      await User.create({
        email: 'admin@example.com',
        password: 'Admin@123', // Will be hashed by pre-save hook
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      console.log('Created test user: admin@example.com / Admin@123');
    }
    return true;
  } catch (error) {
    console.error('Error creating test user:', error);
    return false;
  }
};

// Generate JWT tokens
const generateTokens = (userId: string) => {
  // Access token (short-lived)
  const accessToken = jwt.sign(
    { id: userId, type: 'access' },
    Buffer.from(env.JWT_SECRET, 'utf-8'),
    { expiresIn: '15m' }
  );

  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    Buffer.from(env.JWT_REFRESH_SECRET || env.JWT_SECRET, 'utf-8'),
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Development login endpoint
export const devLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Ensure test user exists
    await createTestUser();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // For development, allow login with test user without password check
    if (email === 'admin@example.com' && password === 'Admin@123') {
      const tokens = generateTokens(user._id.toString());

      // Set refresh token as cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken, // Include for development
        },
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials',
    });
  } catch (error) {
    console.error('Dev login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Development refresh token endpoint
export const devRefreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        Buffer.from(env.JWT_REFRESH_SECRET || env.JWT_SECRET, 'utf-8')
      ) as { id: string; type: string };

      // Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token type',
        });
      }

      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Generate new tokens
      const tokens = generateTokens(user._id.toString());

      // Set new refresh token as cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return res.status(200).json({
        status: 'success',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken, // Include for development
        },
      });
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }
  } catch (error) {
    console.error('Dev refresh token error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
