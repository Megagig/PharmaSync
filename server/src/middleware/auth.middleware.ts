import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/error';
import { verifyToken } from '../config/auth.config';
import { UserRole } from '../interfaces/user.interface';
import { RoleType } from '../interfaces/role.interface';
import User from '../models/user.model';
import Role from '../models/role.model';
import { createActivityLog } from '../controllers/activityLog.controller';
import { ActivityType } from '../interfaces/activityLog.interface';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user exists
    const user = await User.findById(decoded.id)
      .select(
        '-password -passwordResetToken -passwordResetExpires -twoFactorSecret -twoFactorBackupCodes'
      )
      .populate({
        path: 'roles',
        select: 'name type permissions',
      });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );

      if (decoded.iat < changedTimestamp) {
        throw new UnauthorizedError(
          'Password was changed recently. Please log in again'
        );
      }
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedError(
        'Account is temporarily locked. Please try again later'
      );
    }

    // Set user in request
    req.user = user;

    // Update last login time (but don't wait for it to complete)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch((err) => {
      console.error('Error updating last login time:', err);
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }

    next(error);
  }
};

// Alias for backward compatibility
export const authenticate = protect;

/**
 * Middleware to restrict access to specific legacy roles (for backward compatibility)
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      createActivityLog({
        user: req.user.id,
        type: ActivityType.UNAUTHORIZED_ACCESS,
        description: `Attempted to access resource restricted to roles: ${roles.join(
          ', '
        )}`,
        metadata: {
          path: req.originalUrl,
          method: req.method,
          userRole: req.user.role,
        },
      }).catch((err) =>
        console.error('Error logging unauthorized access:', err)
      );

      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};

/**
 * Middleware to restrict access to specific role types (new role system)
 */
export const restrictTo = (roleTypes: RoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    try {
      // Check if user has any of the required role types
      let hasRequiredRole = false;

      // First check populated roles
      if (req.user.roles && Array.isArray(req.user.roles)) {
        hasRequiredRole = req.user.roles.some((role: any) =>
          roleTypes.includes(role.type)
        );
      }

      // If roles aren't populated or user doesn't have required role, check using the method
      if (!hasRequiredRole) {
        for (const roleType of roleTypes) {
          if (await req.user.hasRole(roleType)) {
            hasRequiredRole = true;
            break;
          }
        }
      }

      if (!hasRequiredRole) {
        // Log unauthorized access attempt
        createActivityLog({
          user: req.user.id,
          type: ActivityType.UNAUTHORIZED_ACCESS,
          description: `Attempted to access resource restricted to role types: ${roleTypes.join(
            ', '
          )}`,
          metadata: {
            path: req.originalUrl,
            method: req.method,
            userRoles: req.user.roles
              ? req.user.roles.map((r: any) => r.type || r)
              : [],
          },
        }).catch((err) =>
          console.error('Error logging unauthorized access:', err)
        );

        return next(
          new ForbiddenError(
            'You do not have permission to perform this action'
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require specific permissions
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    try {
      // Check if user has the required permission
      const hasPermission = await req.user.hasPermission(resource, action);

      if (!hasPermission) {
        // Log unauthorized access attempt
        createActivityLog({
          user: req.user.id,
          type: ActivityType.UNAUTHORIZED_ACCESS,
          description: `Attempted to access resource requiring permission: ${resource}:${action}`,
          metadata: {
            path: req.originalUrl,
            method: req.method,
            resource,
            action,
          },
        }).catch((err) =>
          console.error('Error logging unauthorized access:', err)
        );

        return next(
          new ForbiddenError(
            'You do not have permission to perform this action'
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
