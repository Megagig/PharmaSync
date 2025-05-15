import cron from 'node-cron';
import * as notificationService from '../services/notification.service';
import logger from '../utils/logger';

/**
 * Schedule a job to run daily at 1:00 AM to check for upcoming follow-ups
 * and create notifications for them
 */
export const scheduleFollowUpNotificationsJob = () => {
  // Schedule job to run at 1:00 AM every day
  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('Running follow-up notifications job');
      
      // Create care plan follow-up notifications
      const carePlanNotifications = await notificationService.createFollowUpNotifications();
      logger.info(`Created ${carePlanNotifications} care plan follow-up notifications`);
      
      // Create SOAP note follow-up notifications
      const soapNoteNotifications = await notificationService.createSoapNoteFollowUpNotifications();
      logger.info(`Created ${soapNoteNotifications} SOAP note follow-up notifications`);
      
      logger.info('Follow-up notifications job completed successfully');
    } catch (error) {
      logger.error('Error running follow-up notifications job:', error);
    }
  });
  
  logger.info('Follow-up notifications job scheduled');
};

/**
 * Run the follow-up notifications job immediately
 * This can be used for testing or to run the job manually
 */
export const runFollowUpNotificationsJob = async () => {
  try {
    logger.info('Running follow-up notifications job manually');
    
    // Create care plan follow-up notifications
    const carePlanNotifications = await notificationService.createFollowUpNotifications();
    logger.info(`Created ${carePlanNotifications} care plan follow-up notifications`);
    
    // Create SOAP note follow-up notifications
    const soapNoteNotifications = await notificationService.createSoapNoteFollowUpNotifications();
    logger.info(`Created ${soapNoteNotifications} SOAP note follow-up notifications`);
    
    logger.info('Follow-up notifications job completed successfully');
    
    return {
      carePlanNotifications,
      soapNoteNotifications,
      total: carePlanNotifications + soapNoteNotifications
    };
  } catch (error) {
    logger.error('Error running follow-up notifications job:', error);
    throw error;
  }
};
