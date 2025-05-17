import { createCluster } from 'redis';
import env from './env.config';
import { logger } from '../utils/logger';

/**
 * Redis cluster configuration
 */
const redisClusterConfig = {
  rootNodes: [
    {
      url: env.REDIS_CLUSTER_URL || 'redis://localhost:6379',
    },
  ],
  defaults: {
    password: env.REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries: number) => {
        // Exponential backoff with a maximum delay of 10 seconds
        const delay = Math.min(Math.pow(2, retries) * 100, 10000);
        logger.info(`Redis cluster reconnecting in ${delay}ms...`);
        return delay;
      },
    },
  },
};

/**
 * Create Redis cluster client
 */
const createRedisCluster = () => {
  // Check if cluster is enabled
  if (!env.REDIS_CLUSTER_ENABLED) {
    logger.info('Redis cluster is disabled, using standalone Redis');
    return null;
  }
  
  try {
    // Create Redis cluster client
    const redisCluster = createCluster(redisClusterConfig);
    
    // Redis cluster event handlers
    redisCluster.on('connect', () => {
      logger.info('Redis cluster client connected');
    });
    
    redisCluster.on('error', (err) => {
      logger.error(`Redis cluster client error: ${err}`);
    });
    
    redisCluster.on('reconnecting', () => {
      logger.info('Redis cluster client reconnecting');
    });
    
    return redisCluster;
  } catch (error) {
    logger.error(`Failed to create Redis cluster client: ${error}`);
    return null;
  }
};

/**
 * Redis cluster client
 */
const redisCluster = createRedisCluster();

/**
 * Connect to Redis cluster
 */
const connectRedisCluster = async () => {
  try {
    if (redisCluster && !redisCluster.isOpen) {
      await redisCluster.connect();
    }
  } catch (error) {
    logger.error(`Failed to connect to Redis cluster: ${error}`);
  }
};

/**
 * Disconnect from Redis cluster
 */
const disconnectRedisCluster = async () => {
  try {
    if (redisCluster && redisCluster.isOpen) {
      await redisCluster.disconnect();
    }
  } catch (error) {
    logger.error(`Failed to disconnect from Redis cluster: ${error}`);
  }
};

export { redisCluster, connectRedisCluster, disconnectRedisCluster };
