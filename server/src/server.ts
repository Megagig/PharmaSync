import app from './app';
import connectDB from './config/db.config';
import env from './config/env.config';
import logger from './utils/logger';
import { connectRedis, disconnectRedis } from './config/redis';
import { startCacheWarmingJob, stopCacheWarmingJob } from './utils/cacheWarmer';
import mongoose from 'mongoose';

// Initialize server variable
let server: any;

// Connect to MongoDB with retry logic
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start server
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);

      // Start cache warming job in production
      if (env.NODE_ENV === 'production') {
        const cacheWarmingJob = startCacheWarmingJob();

        // Stop cache warming job on process exit
        process.on('exit', () => {
          stopCacheWarmingJob(cacheWarmingJob);
        });
      }
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);

    // If MongoDB connection fails, retry after delay
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      logger.info('MongoDB connection failed. Retrying in 5 seconds...');
      setTimeout(initializeServer, 5000);
    } else {
      // For other errors, exit the process
      process.exit(1);
    }
  }
};

// Start the server
initializeServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);

  // Close server & disconnect from Redis & exit process
  server.close(async () => {
    await disconnectRedis();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  await disconnectRedis();
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await disconnectRedis();
    logger.info('Process terminated!');
    process.exit(0);
  });
});
