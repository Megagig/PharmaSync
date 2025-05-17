import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import config from '../config';
import { RoleType } from '../interfaces/role.interface';

// This file is deprecated. Use auth.middleware.ts instead.
// Keeping for backward compatibility

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Get token from Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Get token from cookie
      token = req.cookies.jwt;
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    // Check if user exists
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles?.map((role) => ({ type: role as RoleType })) || [],
      permissions: user.permissions || [],
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return next(new AppError('Not authorized, token failed', 401));
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required roles
 * @param roles Single role or array of allowed roles
 */
export const authorize = (roles: string | string[]) => {
  // Convert single role to array for consistent handling
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Check if user has any of the allowed roles
    const userRoles = req.user.roles?.map((r) => r.type) || [];
    const hasAllowedRole = userRoles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAllowedRole) {
      return next(
        new AppError(
          `User roles (${userRoles.join(
            ', '
          )}) are not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * Checks if user has required permissions
 * @param requiredPermissions Array of required permissions
 */
export const hasPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) => {
      if (typeof userPermissions[0] === 'string') {
        return userPermissions.includes(permission as any);
      } else {
        // Handle complex permission objects
        return userPermissions.some(
          (p: any) =>
            p.resource === permission.split(':')[1] &&
            p.actions.includes(permission.split(':')[0])
        );
      }
    });

    if (!hasAllPermissions) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
