import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
  IUserCreate,
  IUserLogin,
  IPasswordReset,
  IEmailVerification,
} from '../interfaces/user.interface';
import { BadRequestError } from '../utils/error';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData: IUserCreate = req.body;

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.register(userData, ipAddress, userAgent);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't include refresh token in the response body for security
    const { refreshToken, ...responseData } = result;

    res.status(201).json({
      status: 'success',
      data: responseData,
      message: 'Registration successful. Please verify your email address.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credentials: IUserLogin = req.body;

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(credentials, ipAddress, userAgent);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't include refresh token in the response body for security
    const { refreshToken, ...responseData } = result;

    res.status(200).json({
      status: 'success',
      data: responseData,
    });
  } catch (error: any) {
    // Special handling for 2FA requirement
    if (
      error &&
      error.message === 'Two-factor authentication code required' &&
      error.requiresTwoFactor
    ) {
      return res.status(200).json({
        status: 'success',
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required',
      });
    }

    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const user = await authService.getUserById(userId);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    const user = await authService.updateUser(userId, updateData);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await authService.changePassword(
      userId,
      currentPassword,
      newPassword,
      ipAddress,
      userAgent
    );

    // Clear refresh token cookie since we invalidated all tokens
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message:
        'Password changed successfully. Please log in again with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Get new tokens
    const tokens = await authService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent
    );

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    // Clear the cookie if there's an error
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const refreshToken = req.cookies.refreshToken;

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Invalidate the refresh token
    await authService.logout(userId, refreshToken, ipAddress, userAgent);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await authService.forgotPassword(email, ipAddress, userAgent);

    // Always return success to prevent email enumeration
    res.status(200).json({
      status: 'success',
      message:
        'If a user with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    // Always return success to prevent email enumeration
    res.status(200).json({
      status: 'success',
      message:
        'If a user with that email exists, a password reset link has been sent.',
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body as IPasswordReset;

    if (!token || !newPassword) {
      throw new BadRequestError('Token and new password are required');
    }

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await authService.resetPassword(token, newPassword, ipAddress, userAgent);

    res.status(200).json({
      status: 'success',
      message:
        'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body as IEmailVerification;

    if (!token) {
      throw new BadRequestError('Token is required');
    }

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await authService.verifyEmail(token, ipAddress, userAgent);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};
