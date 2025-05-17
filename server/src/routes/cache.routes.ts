import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { clearAllCache, clearCache } from '../middleware/cache';
import {
  getCacheStats,
  getCacheKeyDetails,
  clearCacheByPattern,
} from '../utils/cacheMonitor';
import {
  getCacheAnalytics,
  resetCacheAnalytics,
} from '../utils/cacheAnalytics';
import {
  getCacheVersion,
  incrementCacheVersion,
  getResourceCacheVersion,
  incrementResourceCacheVersion,
} from '../utils/cacheVersion';
import { logger } from '../utils/logger';

const router = Router();

// Protect all routes and restrict to admin
router.use(authenticate);
router.use(restrictTo([RoleType.ADMIN]));

/**
 * @route GET /api/cache/stats
 * @desc Get cache statistics
 * @access Admin
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getCacheStats();
    const analytics = await getCacheAnalytics();
    const globalVersion = await getCacheVersion();

    return res.status(200).json({
      success: true,
      data: {
        stats,
        analytics,
        version: globalVersion,
      },
    });
  } catch (error) {
    logger.error(`Failed to get cache statistics: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
    });
  }
});

/**
 * @route GET /api/cache/keys
 * @desc Get cache keys by pattern
 * @access Admin
 */
router.get('/keys', async (req: Request, res: Response) => {
  try {
    const { pattern = 'cache:*' } = req.query;

    const keys = await clearCacheByPattern(pattern as string);

    return res.status(200).json({
      success: true,
      data: {
        pattern,
        count: keys,
      },
    });
  } catch (error) {
    logger.error(`Failed to get cache keys: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get cache keys',
    });
  }
});

/**
 * @route GET /api/cache/key/:key
 * @desc Get cache key details
 * @access Admin
 */
router.get('/key/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const details = await getCacheKeyDetails(key);

    return res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    logger.error(`Failed to get cache key details: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get cache key details',
    });
  }
});

/**
 * @route DELETE /api/cache/clear
 * @desc Clear all cache
 * @access Admin
 */
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    await clearAllCache();

    return res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    logger.error(`Failed to clear cache: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

/**
 * @route DELETE /api/cache/clear/:pattern
 * @desc Clear cache by pattern
 * @access Admin
 */
router.delete('/clear/:pattern', async (req: Request, res: Response) => {
  try {
    const { pattern } = req.params;

    const count = await clearCacheByPattern(pattern);

    return res.status(200).json({
      success: true,
      message: `Cleared ${count} cache entries matching pattern: ${pattern}`,
    });
  } catch (error) {
    logger.error(`Failed to clear cache by pattern: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache by pattern',
    });
  }
});

/**
 * @route GET /api/cache/analytics
 * @desc Get cache analytics
 * @access Admin
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await getCacheAnalytics();

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error(`Failed to get cache analytics: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get cache analytics',
    });
  }
});

/**
 * @route DELETE /api/cache/analytics/reset
 * @desc Reset cache analytics
 * @access Admin
 */
router.delete('/analytics/reset', async (req: Request, res: Response) => {
  try {
    await resetCacheAnalytics();

    return res.status(200).json({
      success: true,
      message: 'Cache analytics reset successfully',
    });
  } catch (error) {
    logger.error(`Failed to reset cache analytics: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to reset cache analytics',
    });
  }
});

/**
 * @route GET /api/cache/version
 * @desc Get cache version
 * @access Admin
 */
router.get('/version', async (req: Request, res: Response) => {
  try {
    const globalVersion = await getCacheVersion();

    return res.status(200).json({
      success: true,
      data: {
        version: globalVersion,
      },
    });
  } catch (error) {
    logger.error(`Failed to get cache version: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get cache version',
    });
  }
});

/**
 * @route POST /api/cache/version/increment
 * @desc Increment cache version
 * @access Admin
 */
router.post('/version/increment', async (req: Request, res: Response) => {
  try {
    const newVersion = await incrementCacheVersion();

    return res.status(200).json({
      success: true,
      data: {
        version: newVersion,
      },
      message: `Cache version incremented to ${newVersion}`,
    });
  } catch (error) {
    logger.error(`Failed to increment cache version: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to increment cache version',
    });
  }
});

/**
 * @route GET /api/cache/version/:resource
 * @desc Get resource cache version
 * @access Admin
 */
router.get('/version/:resource', async (req: Request, res: Response) => {
  try {
    const { resource } = req.params;
    const version = await getResourceCacheVersion(resource);

    return res.status(200).json({
      success: true,
      data: {
        resource,
        version,
      },
    });
  } catch (error) {
    logger.error(`Failed to get resource cache version: ${error}`);

    return res.status(500).json({
      success: false,
      error: 'Failed to get resource cache version',
    });
  }
});

/**
 * @route POST /api/cache/version/:resource/increment
 * @desc Increment resource cache version
 * @access Admin
 */
router.post(
  '/version/:resource/increment',
  async (req: Request, res: Response) => {
    try {
      const { resource } = req.params;
      const newVersion = await incrementResourceCacheVersion(resource);

      return res.status(200).json({
        success: true,
        data: {
          resource,
          version: newVersion,
        },
        message: `Cache version for resource ${resource} incremented to ${newVersion}`,
      });
    } catch (error) {
      logger.error(`Failed to increment resource cache version: ${error}`);

      return res.status(500).json({
        success: false,
        error: 'Failed to increment resource cache version',
      });
    }
  }
);

export default router;
