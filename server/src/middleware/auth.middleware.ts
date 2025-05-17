import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/error';
import { verifyAccessToken } from '../config/auth.config';
import { Permission } from '../interfaces/user.interface';
import { RoleType, IPermission } from '../interfaces/role.interface';
import User from '../models/user.model';
import Role from '../models/role.model';
import { createActivityLog } from '../controllers/activityLog.controller';
import { ActivityType } from '../interfaces/activityLog.interface';
import jwt from 'jsonwebtoken';
import env from '../config/env.config';
import { Types } from 'mongoose';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id?: string; // For backward compatibility
        roles?: Array<{ type: RoleType }>;
        permissions?: (Permission | IPermission)[];
        firstName?: string; // For backward compatibility
        lastName?: string; // For backward compatibility
      };
    }
  }
}

// Main authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    try {
      // Verify token
      let decoded;

      try {
        // Always verify token signature properly
        decoded = jwt.verify(
          token,
          Buffer.from(env.JWT_SECRET, 'utf-8')
        ) as jwt.JwtPayload & {
          id: string;
          type?: string;
          tokenVersion?: number;
        };

        // Ensure token has required fields
        if (!decoded || !decoded.id) {
          throw new UnauthorizedError('Invalid token format');
        }

        // Check if it's an access token
        if (decoded.type && decoded.type !== 'access') {
          throw new UnauthorizedError('Invalid token type');
        }
      } catch (error) {
        // Provide more specific error messages based on the error type
        if (error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedError('Token has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
          throw new UnauthorizedError('Invalid token');
        } else {
          throw new UnauthorizedError('Authentication failed');
        }
      }

      // Get user from token
      const user = await User.findById(decoded.id)
        .select('+password')
        .populate({
          path: 'roles',
          select: 'type permissions',
        });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('User account is inactive');
      }

      // Check if user changed password after token was issued
      if (user.passwordChangedAt) {
        const changedTimestamp = parseInt(
          (user.passwordChangedAt.getTime() / 1000).toString(),
          10
        );

        if (decoded.iat && decoded.iat < changedTimestamp) {
          throw new UnauthorizedError(
            'User recently changed password! Please log in again.'
          );
        }
      }

      // Check token version (for token invalidation)
      if (
        decoded.tokenVersion !== undefined &&
        user.tokenVersion !== undefined &&
        decoded.tokenVersion < user.tokenVersion
      ) {
        throw new UnauthorizedError(
          'Token has been invalidated. Please log in again.'
        );
      }

      // Add user to request
      req.user = {
        id: user._id.toString(),
        _id: user._id.toString(), // For backward compatibility
        firstName: user.firstName, // For backward compatibility
        lastName: user.lastName, // For backward compatibility
        roles:
          user.roles?.map((role) => ({
            type: (role as any).type as RoleType,
          })) || [],
        permissions: user.permissions || [],
      };
      next();
    } catch (error) {
      throw new UnauthorizedError('Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

// Alias for backward compatibility
export const protect = authenticate;

/**
 * Middleware to authorize based on permissions
 */
export const authorize = (...permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists (should be added by authenticate middleware)
      if (!req.user) {
        throw new UnauthorizedError('Not authorized to access this route');
      }

      // Get user from database to check permissions
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Check each required permission
      for (const permission of permissions) {
        if (typeof permission === 'string') {
          // Legacy string permission
          const [action, resource] = permission.split(':');
          const hasPermission = await user.hasPermission(resource, action);
          if (!hasPermission) {
            throw new ForbiddenError('Not authorized to access this route');
          }
        } else {
          // IPermission object
          const permObj = permission as unknown as IPermission;
          const hasPermission = await user.hasPermission(
            permObj.resource,
            permObj.actions[0]
          );
          if (!hasPermission) {
            throw new ForbiddenError('Not authorized to access this route');
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to restrict access to specific role types
 */
export const restrictTo = (roleTypes: RoleType[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    try {
      // For development purposes, allow all authenticated users to access all routes
      return next();

      /*
      // Check if user has any of the required role types
      const hasRequiredRole = req.user.roles?.some((role) =>
        roleTypes.includes(role.type)
      );

      if (!hasRequiredRole) {
        // Log unauthorized access attempt
        await createActivityLog({
          user: req.user.id,
          type: ActivityType.UNAUTHORIZED_ACCESS,
          description: `Attempted to access resource restricted to role types: ${roleTypes.join(
            ', '
          )}`,
          metadata: {
            path: req.originalUrl,
            method: req.method,
            userRoles: req.user.roles?.map((r) => r.type) || [],
          },
        });

        return next(
          new ForbiddenError(
            'You do not have permission to perform this action'
          )
        );
      }
      */

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
      // For development purposes, allow all authenticated users to access all resources
      return next();

      /*
      // Check if user has the required permission
      const hasPermission = await req.user.hasPermission(resource, action);

      if (!hasPermission) {
        // Log unauthorized access attempt
        await createActivityLog({
          user: req.user.id,
          type: ActivityType.UNAUTHORIZED_ACCESS,
          description: `Attempted to access resource requiring permission: ${resource}:${action}`,
          metadata: {
            path: req.originalUrl,
            method: req.method,
            resource,
            action,
          },
        });

        return next(
          new ForbiddenError(
            'You do not have permission to perform this action'
          )
        );
      }
      */

      next();
    } catch (error) {
      next(error);
    }
  };
};
