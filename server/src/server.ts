import app from './app';
import connectDB from './config/db.config';
import env from './config/env.config';
import logger from './utils/logger';
import { connectRedis, disconnectRedis } from './config/redis';

// Connect to MongoDB
connectDB();

// Connect to Redis
connectRedis();

// Start server
const server = app.listen(env.PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

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
