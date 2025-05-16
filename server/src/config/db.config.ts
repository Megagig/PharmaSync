import mongoose from 'mongoose';
import env from './env.config';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      env.NODE_ENV === 'test' ? env.MONGODB_URI_TEST : env.MONGODB_URI;

    // For development purposes, we'll allow the server to start even if MongoDB is not available
    if (env.NODE_ENV === 'development' && !mongoURI) {
      logger.warn('MongoDB URI not provided in development mode');
      return;
    }

    await mongoose.connect(mongoURI);

    logger.info('MongoDB connected successfully');
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      logger.error('MongoDB connection error:', error);
      logger.warn('Continuing without MongoDB in development mode');
    } else {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }
};

export default connectDB;
