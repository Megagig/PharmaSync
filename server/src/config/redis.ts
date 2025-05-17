import {
  createClient,
  RedisClientType as RedisClient,
  RedisClientOptions,
} from 'redis';
import env from './env.config';
import logger from '../utils/logger';

const MAX_RETRIES = 5;
const MAX_RETRY_DELAY = 10000; // 10 seconds
const INITIAL_RETRY_DELAY = 100; // 100ms

// Redis client configuration
const redisConfig: RedisClientOptions = {
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD || undefined,
  socket: {
    connectTimeout: 10000, // 10 seconds
    keepAlive: true,
    reconnectStrategy: (retries: number): number | Error => {
      if (retries > MAX_RETRIES) {
        logger.error(`Redis max retries (${MAX_RETRIES}) exceeded`);
        return new Error('Redis max retries exceeded');
      }
      const delay = Math.min(
        Math.pow(2, retries) * INITIAL_RETRY_DELAY,
        MAX_RETRY_DELAY
      );
      logger.info(
        `Redis reconnecting in ${delay}ms... (Attempt ${retries}/${MAX_RETRIES})`
      );
      return delay;
    },
  },
  database: env.REDIS_DB ? parseInt(env.REDIS_DB.toString(), 10) : 0,
};

// Create Redis client
const redisClient = createClient(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

redisClient.on('end', () => {
  logger.info('Redis client connection closed');
});

// Flag to track if Redis is available
let redisAvailable = false;

// Connect to Redis with retry logic
const connectRedis = async (retryCount = 0): Promise<void> => {
  // Skip Redis connection in development mode
  if (env.NODE_ENV === 'development') {
    redisAvailable = false;
    logger.info(
      'Skipping Redis connection in development mode. Caching will be disabled.'
    );
    return;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      redisAvailable = true;
      logger.info('Redis connected successfully');

      // Ping Redis to ensure connection is working
      await redisClient.ping();
      logger.info('Redis ping successful');
    }
  } catch (error) {
    logger.error('Redis connection error:', error);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(
        Math.pow(2, retryCount) * INITIAL_RETRY_DELAY,
        MAX_RETRY_DELAY
      );
      logger.info(
        `Retrying Redis connection in ${delay}ms... (Attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectRedis(retryCount + 1);
    }

    redisAvailable = false;
    logger.error(
      `Failed to connect to Redis after ${MAX_RETRIES} attempts. Caching will be disabled.`
    );
  }
};

// Gracefully disconnect from Redis
const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit(); // Use quit() for graceful shutdown
      redisAvailable = false;
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Failed to disconnect from Redis:', error);
    // Force disconnect if graceful shutdown fails
    try {
      await redisClient.disconnect();
      redisAvailable = false;
      logger.info('Redis force disconnected');
    } catch (forceError) {
      logger.error('Failed to force disconnect from Redis:', forceError);
    }
  }
};

// Check if Redis is available
const isRedisAvailable = (): boolean => redisAvailable;

// Helper function to safely execute Redis operations
const safeRedisOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!isRedisAvailable()) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    logger.error('Redis operation error:', error);
    return fallback;
  }
};

export {
  redisClient,
  connectRedis,
  disconnectRedis,
  isRedisAvailable,
  safeRedisOperation,
};
