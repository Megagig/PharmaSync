import { Request, Response, NextFunction } from 'express';
import { redisClient, isRedisAvailable } from '../config/redis';
import logger from '../utils/logger';
import { getVersionedCacheKey } from '../utils/cacheVersion';
import { recordCacheHit, recordCacheMiss } from '../utils/cacheAnalytics';

/**
 * Interface for cache options
 */
interface CacheOptions {
  /** Cache expiration time in seconds */
  expiration?: number;
  /** Custom key generator function */
  keyGenerator?: (req: Request) => string;
  /** Resource name for versioning */
  resource?: string;
  /** Whether to use versioned cache keys */
  useVersioning?: boolean;
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
  const useVersioning = options.useVersioning !== false; // Default to true

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if Redis is not available
    if (!isRedisAvailable()) {
      return next();
    }

    // Skip caching for non-GET requests unless explicitly configured
    if (req.method !== 'GET' && !options.keyGenerator) {
      return next();
    }

    // Generate base cache key
    const baseCacheKey = keyGenerator(req);

    // Extract resource name from the request path
    const resource = options.resource || req.path.split('/')[1] || 'unknown';

    // Generate versioned cache key if versioning is enabled
    const cacheKey = useVersioning
      ? await getVersionedCacheKey(baseCacheKey, resource)
      : baseCacheKey;

    // Start timing the request
    const startTime = Date.now();

    try {
      // Check if data exists in cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Data found in cache, parse and send response
        const data = JSON.parse(cachedData.toString());
        logger.debug(`Cache hit for key: ${cacheKey}`);

        // Add cache header for debugging
        res.setHeader('X-Cache', 'HIT');

        // Record cache hit with response time
        const responseTime = Date.now() - startTime;
        recordCacheHit(resource, responseTime);

        return res.status(200).json(data);
      }

      // Data not found in cache, continue to the controller
      logger.debug(`Cache miss for key: ${cacheKey}`);

      // Add cache header for debugging
      res.setHeader('X-Cache', 'MISS');

      // Record cache miss (response time will be recorded after the controller responds)

      // Store the original send function
      const originalSend = res.send;

      // Override the send function to cache the response
      res.send = function (body: any): Response {
        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Record cache miss with response time
        recordCacheMiss(resource, responseTime);

        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // Store response in cache
            const responseBody = JSON.parse(body);
            redisClient.setEx(
              cacheKey,
              expiration,
              JSON.stringify(responseBody)
            );
            logger.debug(
              `Cached response for key: ${cacheKey}, expires in ${expiration}s`
            );
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
export const clearCacheByPattern = async (
  pattern: string | string[]
): Promise<void> => {
  // Skip if Redis is not available
  if (!isRedisAvailable()) {
    logger.debug(
      `Redis not available, skipping cache clear for pattern: ${pattern}`
    );
    return;
  }

  try {
    if (Array.isArray(pattern)) {
      // Handle array of patterns
      for (const p of pattern) {
        const keys = await redisClient.keys(`cache:${p}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
          logger.info(
            `Cleared ${keys.length} cache entries matching pattern: ${p}`
          );
        }
      }
    } else {
      // Handle single pattern
      const keys = await redisClient.keys(`cache:${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(
          `Cleared ${keys.length} cache entries matching pattern: ${pattern}`
        );
      }
    }
  } catch (error) {
    logger.error(`Failed to clear cache: ${error}`);
  }
};

/**
 * Middleware to clear cache for specific patterns
 * @param pattern Cache key pattern or array of patterns to clear
 * @returns Express middleware function
 */
export const clearCache = (pattern: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clearCacheByPattern(pattern);
      next();
    } catch (error) {
      logger.error(`Cache clear middleware error: ${error}`);
      next();
    }
  };
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  // Skip if Redis is not available
  if (!isRedisAvailable()) {
    logger.debug('Redis not available, skipping clear all cache');
    return;
  }

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

/**
 * Middleware to clear all cache
 * @returns Express middleware function
 */
export const clearAllCacheMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await clearAllCache();
      next();
    } catch (error) {
      logger.error(`Clear all cache middleware error: ${error}`);
      next();
    }
  };
};
