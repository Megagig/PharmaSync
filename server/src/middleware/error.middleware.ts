import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import logger from '../utils/logger';
import env from '../config/env.config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with request details
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    params: req.params,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Check if it's an operational error (expected error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.statusCode,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      code: 400,
      errors,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      status: 'error',
      message: `Duplicate value for ${field}. This ${field} already exists.`,
      code: 409,
      field,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
      code: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Your session has expired. Please log in again.',
      code: 401,
    });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: `File upload error: ${err.message}`,
      code: 400,
    });
  }

  // Handle rate limit errors
  if (err.name === 'TooManyRequests') {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.',
      code: 429,
    });
  }

  // Handle request timeout
  if (err.name === 'RequestTimeout') {
    return res.status(408).json({
      status: 'error',
      message: 'Request timeout. Please try again.',
      code: 408,
    });
  }

  // For all other errors, return a generic error message
  const statusCode = (err as any).statusCode || 500;
  return res.status(statusCode).json({
    status: 'error',
    message: env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message,
    code: statusCode,
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

// Handle 404 errors
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = `Route not found: Cannot ${req.method} ${req.originalUrl}`;
  logger.warn(message, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    params: req.params,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  res.status(404).json({
    status: 'error',
    message,
    code: 404,
  });
};
