import { Request, Response, NextFunction } from 'express';
import { runFollowUpNotificationsJob } from '../jobs/followUpNotifications.job';

/**
 * @desc    Manually trigger the follow-up notifications job
 * @route   POST /api/follow-ups/trigger-notifications
 * @access  Private/Admin
 */
export const triggerFollowUpNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await runFollowUpNotificationsJob();
    
    res.status(200).json({
      status: 'success',
      message: 'Follow-up notifications job triggered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
