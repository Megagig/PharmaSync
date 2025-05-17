import { createClient } from 'redis';
import env from './env.config';
import { logger } from '../utils/logger';

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

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error}`);
  }
};

// Disconnect from Redis
const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
    }
  } catch (error) {
    logger.error(`Failed to disconnect from Redis: ${error}`);
  }
};

export { redisClient, connectRedis, disconnectRedis };
