import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Interface for cache options
 */
interface CacheOptions {
  /** Cache expiration time in seconds */
  expiration?: number;
  /** Custom key generator function */
  keyGenerator?: (req: Request) => string;
}

/**
 * Default cache expiration time in seconds (1 hour)
 */
const DEFAULT_EXPIRATION = 3600;

/**
 * Generate a cache key based on the request
 * @param req Express request object
 * @returns Cache key string
 */
const generateCacheKey = (req: Request): string => {
  // Create a key based on the URL and query parameters
  const baseUrl = req.originalUrl || req.url;
  
  // For GET requests, include query parameters in the key
  if (req.method === 'GET') {
    return `cache:${req.method}:${baseUrl}`;
  }
  
  // For other methods, include the request body in the key
  return `cache:${req.method}:${baseUrl}:${JSON.stringify(req.body)}`;
};

/**
 * Middleware to cache API responses
 * @param options Cache options
 * @returns Express middleware function
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const expiration = options.expiration || DEFAULT_EXPIRATION;
  const keyGenerator = options.keyGenerator || generateCacheKey;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests unless explicitly configured
    if (req.method !== 'GET' && !options.keyGenerator) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator(req);

    try {
      // Check if data exists in cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Data found in cache, parse and send response
        const data = JSON.parse(cachedData);
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.status(200).json(data);
      }

      // Data not found in cache, continue to the controller
      logger.debug(`Cache miss for key: ${cacheKey}`);

      // Store the original send function
      const originalSend = res.send;

      // Override the send function to cache the response
      res.send = function (body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // Store response in cache
            const responseBody = JSON.parse(body);
            redisClient.setEx(cacheKey, expiration, JSON.stringify(responseBody));
            logger.debug(`Cached response for key: ${cacheKey}, expires in ${expiration}s`);
          } catch (error) {
            logger.error(`Failed to cache response: ${error}`);
          }
        }

        // Call the original send function
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error}`);
      next();
    }
  };
};

/**
 * Clear cache for a specific pattern
 * @param pattern Cache key pattern to clear
 */
export const clearCache = async (pattern: string): Promise<void> => {
  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(`cache:${pattern}*`);
    
    if (keys.length > 0) {
      // Delete all matching keys
      await redisClient.del(keys);
      logger.info(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Failed to clear cache: ${error}`);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    // Get all cache keys
    const keys = await redisClient.keys('cache:*');
    
    if (keys.length > 0) {
      // Delete all cache keys
      await redisClient.del(keys);
      logger.info(`Cleared all ${keys.length} cache entries`);
    }
  } catch (error) {
    logger.error(`Failed to clear all cache: ${error}`);
  }
};
