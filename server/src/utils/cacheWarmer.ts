import { redisClient } from '../config/redis';
import logger from './logger';
import axios from 'axios';
import env from '../config/env.config';

/**
 * Cache warming configuration
 */
interface CacheWarmingConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  endpoints: {
    path: string;
    expiration: number; // in seconds
    params?: Record<string, any>;
  }[];
}

/**
 * Cache warming configuration
 */
const cacheWarmingConfig: CacheWarmingConfig = {
  enabled: true,
  interval: 15 * 60 * 1000, // 15 minutes
  endpoints: [
    {
      path: '/api/medications',
      expiration: 3600, // 1 hour
    },
    {
      path: '/api/medications/low-stock',
      expiration: 1800, // 30 minutes
    },
    {
      path: '/api/medications/expiring',
      expiration: 1800, // 30 minutes
    },
    {
      path: '/api/inventory/low-stock',
      expiration: 1800, // 30 minutes
    },
    {
      path: '/api/inventory/expiring',
      expiration: 1800, // 30 minutes
    },
    {
      path: '/api/dashboard/stats',
      expiration: 1800, // 30 minutes
    },
  ],
};

/**
 * Warm up the cache for a specific endpoint
 * @param endpoint Endpoint configuration
 * @param token JWT token for authentication
 */
const warmEndpoint = async (
  endpoint: CacheWarmingConfig['endpoints'][0],
  token: string
): Promise<void> => {
  try {
    const url = `http://localhost:${env.PORT}${endpoint.path}`;

    logger.debug(`Warming cache for endpoint: ${endpoint.path}`);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: endpoint.params,
    });

    if (response.status === 200) {
      const cacheKey = `cache:${endpoint.path}`;

      await redisClient.setEx(
        cacheKey,
        endpoint.expiration,
        JSON.stringify(response.data)
      );

      logger.debug(`Cache warmed for endpoint: ${endpoint.path}`);
    }
  } catch (error) {
    logger.error(
      `Failed to warm cache for endpoint ${endpoint.path}: ${error}`
    );
  }
};

/**
 * Get admin token for cache warming
 * @returns Promise with admin token
 */
const getAdminToken = async (): Promise<string> => {
  try {
    // This is a simplified example. In a real application, you would use a service account
    // or a dedicated admin account for cache warming.
    const url = `http://localhost:${env.PORT}/api/auth/login`;

    const response = await axios.post(url, {
      email: process.env.CACHE_WARMER_EMAIL || 'admin@example.com',
      password: process.env.CACHE_WARMER_PASSWORD || 'password',
    });

    if (response.status === 200 && response.data.token) {
      return response.data.token;
    }

    throw new Error('Failed to get admin token');
  } catch (error) {
    logger.error(`Failed to get admin token for cache warming: ${error}`);
    throw error;
  }
};

/**
 * Warm up the cache for all configured endpoints
 */
export const warmCache = async (): Promise<void> => {
  if (!cacheWarmingConfig.enabled) {
    return;
  }

  try {
    logger.info('Starting cache warming...');

    const token = await getAdminToken();

    await Promise.all(
      cacheWarmingConfig.endpoints.map((endpoint) =>
        warmEndpoint(endpoint, token)
      )
    );

    logger.info('Cache warming completed');
  } catch (error) {
    logger.error(`Cache warming failed: ${error}`);
  }
};

/**
 * Start cache warming job
 */
export const startCacheWarmingJob = (): NodeJS.Timeout => {
  if (!cacheWarmingConfig.enabled) {
    logger.info('Cache warming is disabled');
    return null as unknown as NodeJS.Timeout;
  }

  logger.info(
    `Starting cache warming job with interval: ${cacheWarmingConfig.interval}ms`
  );

  // Warm cache immediately
  warmCache();

  // Schedule periodic cache warming
  return setInterval(warmCache, cacheWarmingConfig.interval);
};

/**
 * Stop cache warming job
 * @param job Cache warming job
 */
export const stopCacheWarmingJob = (job: NodeJS.Timeout): void => {
  if (job) {
    clearInterval(job);
    logger.info('Cache warming job stopped');
  }
};
