import { redisClient } from '../config/redis';
import { logger } from './logger';

/**
 * Cache version key in Redis
 */
const CACHE_VERSION_KEY = 'cache:version';

/**
 * Cache version by resource
 */
const CACHE_RESOURCE_VERSION_PREFIX = 'cache:version:';

/**
 * Default cache version
 */
const DEFAULT_CACHE_VERSION = '1.0.0';

/**
 * Get the global cache version
 * @returns Promise with the cache version
 */
export const getCacheVersion = async (): Promise<string> => {
  try {
    const version = await redisClient.get(CACHE_VERSION_KEY);
    return version || DEFAULT_CACHE_VERSION;
  } catch (error) {
    logger.error(`Failed to get cache version: ${error}`);
    return DEFAULT_CACHE_VERSION;
  }
};

/**
 * Set the global cache version
 * @param version New cache version
 * @returns Promise with success status
 */
export const setCacheVersion = async (version: string): Promise<boolean> => {
  try {
    await redisClient.set(CACHE_VERSION_KEY, version);
    logger.info(`Cache version updated to ${version}`);
    return true;
  } catch (error) {
    logger.error(`Failed to set cache version: ${error}`);
    return false;
  }
};

/**
 * Increment the global cache version
 * @returns Promise with the new cache version
 */
export const incrementCacheVersion = async (): Promise<string> => {
  try {
    const currentVersion = await getCacheVersion();
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Increment patch version
    const newVersion = `${major}.${minor}.${patch + 1}`;
    
    await setCacheVersion(newVersion);
    logger.info(`Cache version incremented to ${newVersion}`);
    
    return newVersion;
  } catch (error) {
    logger.error(`Failed to increment cache version: ${error}`);
    return DEFAULT_CACHE_VERSION;
  }
};

/**
 * Get the cache version for a specific resource
 * @param resource Resource name
 * @returns Promise with the resource cache version
 */
export const getResourceCacheVersion = async (resource: string): Promise<string> => {
  try {
    const key = `${CACHE_RESOURCE_VERSION_PREFIX}${resource}`;
    const version = await redisClient.get(key);
    return version || DEFAULT_CACHE_VERSION;
  } catch (error) {
    logger.error(`Failed to get cache version for resource ${resource}: ${error}`);
    return DEFAULT_CACHE_VERSION;
  }
};

/**
 * Set the cache version for a specific resource
 * @param resource Resource name
 * @param version New cache version
 * @returns Promise with success status
 */
export const setResourceCacheVersion = async (
  resource: string,
  version: string
): Promise<boolean> => {
  try {
    const key = `${CACHE_RESOURCE_VERSION_PREFIX}${resource}`;
    await redisClient.set(key, version);
    logger.info(`Cache version for resource ${resource} updated to ${version}`);
    return true;
  } catch (error) {
    logger.error(`Failed to set cache version for resource ${resource}: ${error}`);
    return false;
  }
};

/**
 * Increment the cache version for a specific resource
 * @param resource Resource name
 * @returns Promise with the new cache version
 */
export const incrementResourceCacheVersion = async (resource: string): Promise<string> => {
  try {
    const currentVersion = await getResourceCacheVersion(resource);
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Increment patch version
    const newVersion = `${major}.${minor}.${patch + 1}`;
    
    await setResourceCacheVersion(resource, newVersion);
    logger.info(`Cache version for resource ${resource} incremented to ${newVersion}`);
    
    return newVersion;
  } catch (error) {
    logger.error(`Failed to increment cache version for resource ${resource}: ${error}`);
    return DEFAULT_CACHE_VERSION;
  }
};

/**
 * Generate a versioned cache key
 * @param key Original cache key
 * @param resource Resource name (optional)
 * @returns Promise with the versioned cache key
 */
export const getVersionedCacheKey = async (
  key: string,
  resource?: string
): Promise<string> => {
  try {
    let version: string;
    
    if (resource) {
      // Get resource-specific version
      version = await getResourceCacheVersion(resource);
    } else {
      // Get global version
      version = await getCacheVersion();
    }
    
    return `${key}:v${version}`;
  } catch (error) {
    logger.error(`Failed to generate versioned cache key: ${error}`);
    return `${key}:v${DEFAULT_CACHE_VERSION}`;
  }
};
