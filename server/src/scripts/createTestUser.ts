/**
 * Script to create a test user in the local MongoDB database
 * Run with: npx ts-node src/scripts/createTestUser.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Define User schema (simplified version of your actual User model)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'PHARMACIST', 'MANAGER', 'CASHIER'],
      default: 'PHARMACIST',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true, // Set to true for test user
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Create User model
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is required. Please check your .env file.');
    }

    console.log('Connecting to MongoDB...');

    // Determine if we're connecting to a local MongoDB instance
    const isLocalConnection = mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1');
    
    // Connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      // Only use SSL/TLS for remote connections (like MongoDB Atlas)
      ssl: !isLocalConnection,
      tls: !isLocalConnection,
    };

    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test user
const createTestUser = async (): Promise<void> => {
  try {
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin@pharmasync.com' });

    if (existingUser) {
      console.log('Test admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    // Create admin user
    const adminUser = new User({
      email: 'admin@pharmasync.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
      verificationToken: uuidv4(),
    });

    await adminUser.save();
    console.log('Test admin user created successfully');

    // Create pharmacist user
    const pharmacistUser = new User({
      email: 'pharmacist@pharmasync.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Pharmacist',
      role: 'PHARMACIST',
      isActive: true,
      isEmailVerified: true,
      verificationToken: uuidv4(),
    });

    await pharmacistUser.save();
    console.log('Test pharmacist user created successfully');
  } catch (error) {
    console.error('Error creating test users:', error);
  }
};

// Main function
const main = async (): Promise<void> => {
  try {
    await connectDB();
    await createTestUser();
    console.log('Test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
main();
