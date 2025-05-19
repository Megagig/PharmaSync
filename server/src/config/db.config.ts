import mongoose from 'mongoose';
import logger from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    // Get MongoDB URI directly from environment variables
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is required. Please check your .env file.');
    }

    logger.info('Connecting to MongoDB Atlas...');

    // Log connection string type (SRV or direct)
    logger.info(
      `Connection string type: ${
        mongoURI.includes('mongodb+srv') ? 'SRV' : 'Direct'
      }`
    );

    // Configure Mongoose
    mongoose.set('strictQuery', true);

    // Connect to MongoDB with improved options for Atlas
    await mongoose.connect(mongoURI, {
      // Connection pool size
      maxPoolSize: 10,

      // Timeouts
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds

      // Retry options
      retryWrites: true,
      retryReads: true,
    });

    // Add connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    logger.info('MongoDB connection initialized successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Don't exit the process, let the application handle the error
    throw error;
  }
};

// Export the mongoose instance for use in tests
export { mongoose };
export default connectDB;
