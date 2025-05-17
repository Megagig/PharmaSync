import { redisClient } from '../config/redis';
import { logger } from './logger';

/**
 * Cache statistics interface
 */
interface CacheStats {
  totalKeys: number;
  keysByPrefix: Record<string, number>;
  memoryUsage: string;
  hitRate?: number;
  missRate?: number;
  uptime: string;
}

/**
 * Get cache statistics
 * @returns Promise with cache statistics
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    // Get all keys
    const keys = await redisClient.keys('cache:*');
    
    // Count keys by prefix
    const keysByPrefix: Record<string, number> = {};
    keys.forEach(key => {
      const parts = key.split(':');
      if (parts.length >= 3) {
        const prefix = `${parts[0]}:${parts[1]}:${parts[2]}`;
        keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
      }
    });
    
    // Get memory usage
    const info = await redisClient.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
    
    // Get hit/miss stats if available
    const statsInfo = await redisClient.info('stats');
    const hitsMatch = statsInfo.match(/keyspace_hits:(\d+)/);
    const missesMatch = statsInfo.match(/keyspace_misses:(\d+)/);
    
    let hitRate: number | undefined;
    let missRate: number | undefined;
    
    if (hitsMatch && missesMatch) {
      const hits = parseInt(hitsMatch[1], 10);
      const misses = parseInt(missesMatch[1], 10);
      const total = hits + misses;
      
      if (total > 0) {
        hitRate = parseFloat((hits / total * 100).toFixed(2));
        missRate = parseFloat((misses / total * 100).toFixed(2));
      }
    }
    
    // Get uptime
    const serverInfo = await redisClient.info('server');
    const uptimeMatch = serverInfo.match(/uptime_in_seconds:(\d+)/);
    const uptimeSeconds = uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0;
    
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    return {
      totalKeys: keys.length,
      keysByPrefix,
      memoryUsage,
      hitRate,
      missRate,
      uptime
    };
  } catch (error) {
    logger.error(`Failed to get cache statistics: ${error}`);
    return {
      totalKeys: 0,
      keysByPrefix: {},
      memoryUsage: 'Unknown',
      uptime: 'Unknown'
    };
  }
};

/**
 * Get detailed information about a specific cache key
 * @param key Cache key
 * @returns Promise with key details
 */
export const getCacheKeyDetails = async (key: string): Promise<any> => {
  try {
    // Check if key exists
    const exists = await redisClient.exists(key);
    
    if (!exists) {
      return { exists: false };
    }
    
    // Get key type
    const type = await redisClient.type(key);
    
    // Get TTL
    const ttl = await redisClient.ttl(key);
    
    // Get value (only for string type)
    let value = null;
    if (type === 'string') {
      value = await redisClient.get(key);
      
      // Try to parse as JSON
      try {
        value = JSON.parse(value as string);
      } catch (e) {
        // Not JSON, keep as is
      }
    }
    
    return {
      exists: true,
      key,
      type,
      ttl: ttl === -1 ? 'No expiration' : `${ttl} seconds`,
      value
    };
  } catch (error) {
    logger.error(`Failed to get cache key details: ${error}`);
    return { error: 'Failed to get cache key details' };
  }
};

/**
 * Clear cache by pattern
 * @param pattern Cache key pattern
 * @returns Promise with number of keys deleted
 */
export const clearCacheByPattern = async (pattern: string): Promise<number> => {
  try {
    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await redisClient.del(keys);
    logger.info(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    
    return keys.length;
  } catch (error) {
    logger.error(`Failed to clear cache by pattern: ${error}`);
    return 0;
  }
};

/**
 * Log cache statistics
 */
export const logCacheStats = async (): Promise<void> => {
  try {
    const stats = await getCacheStats();
    
    logger.info('Cache Statistics:');
    logger.info(`Total Keys: ${stats.totalKeys}`);
    logger.info(`Memory Usage: ${stats.memoryUsage}`);
    
    if (stats.hitRate !== undefined && stats.missRate !== undefined) {
      logger.info(`Hit Rate: ${stats.hitRate}%`);
      logger.info(`Miss Rate: ${stats.missRate}%`);
    }
    
    logger.info('Keys by Prefix:');
    Object.entries(stats.keysByPrefix).forEach(([prefix, count]) => {
      logger.info(`  ${prefix}: ${count}`);
    });
  } catch (error) {
    logger.error(`Failed to log cache statistics: ${error}`);
  }
};
