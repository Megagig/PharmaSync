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

    logger.info('Connecting to MongoDB...');

    // Configure Mongoose
    mongoose.set('strictQuery', true);

    // Connection options for MongoDB Atlas
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      ssl: true,
      tls: true,
    };

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);

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
    process.exit(1);
  }
};

// Export the mongoose instance for use in tests
export { mongoose };
export default connectDB;
