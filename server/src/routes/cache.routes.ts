import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { clearAllCache, clearCache } from '../middleware/cache';
import { getCacheStats, getCacheKeyDetails, clearCacheByPattern } from '../utils/cacheMonitor';
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
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Failed to get cache statistics: ${error}`);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
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
        count: keys
      }
    });
  } catch (error) {
    logger.error(`Failed to get cache keys: ${error}`);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache keys'
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
      data: details
    });
  } catch (error) {
    logger.error(`Failed to get cache key details: ${error}`);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache key details'
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
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    logger.error(`Failed to clear cache: ${error}`);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
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
      message: `Cleared ${count} cache entries matching pattern: ${pattern}`
    });
  } catch (error) {
    logger.error(`Failed to clear cache by pattern: ${error}`);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache by pattern'
    });
  }
});

export default router;
