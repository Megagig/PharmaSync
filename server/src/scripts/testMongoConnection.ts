/**
 * Script to test MongoDB connection
 * Run with: npx ts-node src/scripts/testMongoConnection.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is required. Please check your .env file.');
    }

    console.log('MongoDB URI:', mongoURI);
    console.log('Connecting to MongoDB...');

    // Connect with simplified configuration
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Run the test
testConnection();
