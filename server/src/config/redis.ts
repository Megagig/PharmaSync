import { createClient } from 'redis';
import env from './env.config';
import logger from '../utils/logger';

// Redis client configuration
const redisConfig = {
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries: number) => {
      // Exponential backoff with a maximum delay of 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      logger.info(`Redis reconnecting in ${delay}ms...`);
      return delay;
    },
  },
};

// Create Redis client
const redisClient = createClient(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error(`Redis client error: ${err}`);
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

// Flag to track if Redis is available
let redisAvailable = false;

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      redisAvailable = true;
      logger.info('Redis connected successfully');
    }
  } catch (error) {
    redisAvailable = false;
    logger.warn(`Redis not available: ${error}. Caching will be disabled.`);
  }
};

// Disconnect from Redis
const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      redisAvailable = false;
    }
  } catch (error) {
    logger.error(`Failed to disconnect from Redis: ${error}`);
  }
};

// Check if Redis is available
const isRedisAvailable = () => redisAvailable;

export { redisClient, connectRedis, disconnectRedis, isRedisAvailable };
