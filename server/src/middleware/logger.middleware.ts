import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import logger from '../utils/logger';
import env from '../config/env.config';

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Skip logging in test environment
const skip = () => {
  return env.NODE_ENV === 'test';
};

// Morgan middleware
export const morganMiddleware = morgan(
  // Define message format
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

// Custom request logger middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id,
  });
  
  next();
};
