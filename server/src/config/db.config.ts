import mongoose from 'mongoose';
import env from './env.config';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.NODE_ENV === 'test' ? env.MONGODB_URI_TEST : env.MONGODB_URI;
    
    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
