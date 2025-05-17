import { redisClient, isRedisAvailable } from '../config/redis';
import logger from './logger';

/**
 * Cache analytics keys
 */
const CACHE_HITS_KEY = 'cache:analytics:hits';
const CACHE_MISSES_KEY = 'cache:analytics:misses';
const CACHE_HITS_BY_RESOURCE_PREFIX = 'cache:analytics:hits:';
const CACHE_MISSES_BY_RESOURCE_PREFIX = 'cache:analytics:misses:';
const CACHE_RESPONSE_TIME_KEY = 'cache:analytics:response_time';
const CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX = 'cache:analytics:response_time:';

/**
 * Record a cache hit
 * @param resource Resource name
 * @param responseTime Response time in milliseconds
 */
export const recordCacheHit = async (
  resource: string,
  responseTime: number
): Promise<void> => {
  // Skip if Redis is not available
  if (!isRedisAvailable()) {
    return;
  }

  try {
    // Increment global hits counter
    await redisClient.incr(CACHE_HITS_KEY);

    // Increment resource-specific hits counter
    await redisClient.incr(`${CACHE_HITS_BY_RESOURCE_PREFIX}${resource}`);

    // Record response time
    await redisClient.lpush(CACHE_RESPONSE_TIME_KEY, responseTime.toString());
    await redisClient.lpush(
      `${CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX}${resource}`,
      responseTime.toString()
    );

    // Trim response time lists to keep only the last 1000 entries
    await redisClient.ltrim(CACHE_RESPONSE_TIME_KEY, 0, 999);
    await redisClient.ltrim(
      `${CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX}${resource}`,
      0,
      999
    );
  } catch (error) {
    logger.error(`Failed to record cache hit: ${error}`);
  }
};

/**
 * Record a cache miss
 * @param resource Resource name
 * @param responseTime Response time in milliseconds
 */
export const recordCacheMiss = async (
  resource: string,
  responseTime: number
): Promise<void> => {
  // Skip if Redis is not available
  if (!isRedisAvailable()) {
    return;
  }

  try {
    // Increment global misses counter
    await redisClient.incr(CACHE_MISSES_KEY);

    // Increment resource-specific misses counter
    await redisClient.incr(`${CACHE_MISSES_BY_RESOURCE_PREFIX}${resource}`);

    // Record response time
    await redisClient.lpush(CACHE_RESPONSE_TIME_KEY, responseTime.toString());
    await redisClient.lpush(
      `${CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX}${resource}`,
      responseTime.toString()
    );

    // Trim response time lists to keep only the last 1000 entries
    await redisClient.ltrim(CACHE_RESPONSE_TIME_KEY, 0, 999);
    await redisClient.ltrim(
      `${CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX}${resource}`,
      0,
      999
    );
  } catch (error) {
    logger.error(`Failed to record cache miss: ${error}`);
  }
};

/**
 * Get cache hit rate
 * @returns Promise with cache hit rate
 */
export const getCacheHitRate = async (): Promise<number> => {
  // Return 0 if Redis is not available
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const hitsData = await redisClient.get(CACHE_HITS_KEY);
    const missesData = await redisClient.get(CACHE_MISSES_KEY);

    const hits = parseInt(hitsData ? hitsData.toString() : '0', 10);
    const misses = parseInt(missesData ? missesData.toString() : '0', 10);
    const total = hits + misses;

    if (total === 0) {
      return 0;
    }

    return parseFloat(((hits / total) * 100).toFixed(2));
  } catch (error) {
    logger.error(`Failed to get cache hit rate: ${error}`);
    return 0;
  }
};

/**
 * Get cache hit rate by resource
 * @param resource Resource name
 * @returns Promise with cache hit rate for the resource
 */
export const getCacheHitRateByResource = async (
  resource: string
): Promise<number> => {
  // Return 0 if Redis is not available
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const hitsData = await redisClient.get(
      `${CACHE_HITS_BY_RESOURCE_PREFIX}${resource}`
    );
    const missesData = await redisClient.get(
      `${CACHE_MISSES_BY_RESOURCE_PREFIX}${resource}`
    );

    const hits = parseInt(hitsData ? hitsData.toString() : '0', 10);
    const misses = parseInt(missesData ? missesData.toString() : '0', 10);
    const total = hits + misses;

    if (total === 0) {
      return 0;
    }

    return parseFloat(((hits / total) * 100).toFixed(2));
  } catch (error) {
    logger.error(
      `Failed to get cache hit rate for resource ${resource}: ${error}`
    );
    return 0;
  }
};

/**
 * Get average response time
 * @returns Promise with average response time in milliseconds
 */
export const getAverageResponseTime = async (): Promise<number> => {
  // Return 0 if Redis is not available
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const responseTimes = await redisClient.lrange(
      CACHE_RESPONSE_TIME_KEY,
      0,
      -1
    );

    // Check if response times exist and is an array
    if (
      !responseTimes ||
      !Array.isArray(responseTimes) ||
      responseTimes.length === 0
    ) {
      return 0;
    }

    // Ensure we're working with an array of strings
    const responseTimeStrings = responseTimes.map((time) =>
      typeof time === 'string' ? time : String(time)
    );

    const total = responseTimeStrings.reduce(
      (sum, time) => sum + parseInt(time, 10),
      0
    );

    return parseFloat((total / responseTimeStrings.length).toFixed(2));
  } catch (error) {
    logger.error(`Failed to get average response time: ${error}`);
    return 0;
  }
};

/**
 * Get average response time by resource
 * @param resource Resource name
 * @returns Promise with average response time for the resource in milliseconds
 */
export const getAverageResponseTimeByResource = async (
  resource: string
): Promise<number> => {
  // Return 0 if Redis is not available
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const responseTimes = await redisClient.lrange(
      `${CACHE_RESPONSE_TIME_BY_RESOURCE_PREFIX}${resource}`,
      0,
      -1
    );

    // Check if response times exist and is an array
    if (
      !responseTimes ||
      !Array.isArray(responseTimes) ||
      responseTimes.length === 0
    ) {
      return 0;
    }

    // Ensure we're working with an array of strings
    const responseTimeStrings = responseTimes.map((time) =>
      typeof time === 'string' ? time : String(time)
    );

    const total = responseTimeStrings.reduce(
      (sum, time) => sum + parseInt(time, 10),
      0
    );

    return parseFloat((total / responseTimeStrings.length).toFixed(2));
  } catch (error) {
    logger.error(
      `Failed to get average response time for resource ${resource}: ${error}`
    );
    return 0;
  }
};

/**
 * Get cache analytics
 * @returns Promise with cache analytics
 */
export const getCacheAnalytics = async (): Promise<any> => {
  // Return empty analytics if Redis is not available
  if (!isRedisAvailable()) {
    return {
      global: {
        hitRate: 0,
        averageResponseTime: 0,
      },
      resources: [],
      redisAvailable: false,
    };
  }

  try {
    const hitRate = await getCacheHitRate();
    const averageResponseTime = await getAverageResponseTime();

    // Get all resource keys
    const hitKeys = await redisClient.keys(`${CACHE_HITS_BY_RESOURCE_PREFIX}*`);
    const resources = hitKeys.map((key) =>
      key.toString().replace(CACHE_HITS_BY_RESOURCE_PREFIX, '')
    );

    // Get resource-specific analytics
    const resourceAnalytics = await Promise.all(
      resources.map(async (resource) => {
        const hitRate = await getCacheHitRateByResource(resource);
        const averageResponseTime = await getAverageResponseTimeByResource(
          resource
        );

        return {
          resource,
          hitRate,
          averageResponseTime,
        };
      })
    );

    return {
      global: {
        hitRate,
        averageResponseTime,
      },
      resources: resourceAnalytics,
      redisAvailable: true,
    };
  } catch (error) {
    logger.error(`Failed to get cache analytics: ${error}`);
    return {
      global: {
        hitRate: 0,
        averageResponseTime: 0,
      },
      resources: [],
      redisAvailable: false,
    };
  }
};

/**
 * Reset cache analytics
 */
export const resetCacheAnalytics = async (): Promise<void> => {
  // Skip if Redis is not available
  if (!isRedisAvailable()) {
    logger.debug('Redis not available, skipping reset cache analytics');
    return;
  }

  try {
    // Get all analytics keys
    const keys = await redisClient.keys('cache:analytics:*');

    if (keys.length > 0) {
      // Delete all analytics keys
      await redisClient.del(keys);
      logger.info(`Reset ${keys.length} cache analytics entries`);
    }
  } catch (error) {
    logger.error(`Failed to reset cache analytics: ${error}`);
  }
};
