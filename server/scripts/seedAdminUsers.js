/**
 * Script to seed admin users into MongoDB using the actual User model
 * Run with: node scripts/seedAdminUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Convert SRV connection string to direct connection string if needed
function getDirectConnectionString(uri) {
  if (!uri) return null;

  // If it's already a direct connection string, return it as is
  if (!uri.includes('mongodb+srv://')) {
    return uri;
  }

  try {
    // Extract parts from the SRV connection string
    const regex = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/;
    const matches = uri.match(regex);

    if (!matches) {
      console.log('Could not parse MongoDB URI');
      return uri;
    }

    const [, username, password, host, database, queryParams] = matches;

    // Create a direct connection string
    // Note: This is a simplified approach and might not work for all Atlas clusters
    const directUri = `mongodb://${username}:${password}@${host.replace(
      /\.[^.]+$/,
      ''
    )}-shard-00-00.${host.split('.').slice(1).join('.')}:27017,${host.replace(
      /\.[^.]+$/,
      ''
    )}-shard-00-01.${host.split('.').slice(1).join('.')}:27017,${host.replace(
      /\.[^.]+$/,
      ''
    )}-shard-00-02.${host
      .split('.')
      .slice(1)
      .join('.')}:27017/${database}?ssl=true&replicaSet=atlas-${
      host.split('-')[0]
    }&authSource=admin${queryParams || ''}`;

    console.log('Using direct connection string');
    return directUri;
  } catch (error) {
    console.error('Error converting connection string:', error);
    return uri;
  }
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');

    if (!MONGODB_URI) {
      console.error('MongoDB URI is not set in environment variables');
      process.exit(1);
    }

    // Convert to direct connection string if needed
    const connectionString = getDirectConnectionString(MONGODB_URI);
    console.log(
      'Connection string type:',
      connectionString.includes('mongodb+srv') ? 'SRV' : 'Direct'
    );

    // Add more detailed logging
    console.log('Attempting to connect to MongoDB...');

    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      ssl: true,
      tls: true,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Seed users directly using the MongoDB driver
const seedUsers = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if users already exist
    const adminExists = await usersCollection.findOne({
      email: 'megagigdev@gmail.com',
    });
    const pharmacistExists = await usersCollection.findOne({
      email: 'turningpointcodes@gmail.com',
    });

    // Delete existing users if they exist
    if (adminExists) {
      console.log('Deleting existing admin user...');
      await usersCollection.deleteOne({ email: 'megagigdev@gmail.com' });
    }

    if (pharmacistExists) {
      console.log('Deleting existing pharmacist user...');
      await usersCollection.deleteOne({ email: 'turningpointcodes@gmail.com' });
    }

    // Hash passwords
    const adminPassword = await hashPassword('Anthony@247');
    const pharmacistPassword = await hashPassword('Pharmacist@247');

    // Current timestamp
    const now = new Date();

    // Create admin user
    const admin = {
      email: 'megagigdev@gmail.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      approvalStatus: 'approved',
      phoneNumber: '+1234567890',
      createdAt: now,
      updatedAt: now,
      tokenVersion: 0,
      permissions: [
        'user:read',
        'user:write',
        'user:delete',
        'role:read',
        'role:write',
        'role:delete',
        'permission:read',
        'permission:write',
        'permission:delete',
      ],
      securityEvents: [
        {
          type: 'account_created',
          timestamp: now,
          details: 'Account created by seed script',
        },
      ],
    };

    // Create pharmacist user
    const pharmacist = {
      email: 'turningpointcodes@gmail.com',
      password: pharmacistPassword,
      firstName: 'Pharmacist',
      lastName: 'User',
      role: 'pharmacist',
      isActive: true,
      isEmailVerified: true,
      approvalStatus: 'approved',
      phoneNumber: '+0987654321',
      licenseNumber: 'PHARM-12345',
      createdAt: now,
      updatedAt: now,
      tokenVersion: 0,
      permissions: [
        'patient:read',
        'patient:write',
        'medication:read',
        'medication:write',
        'prescription:read',
        'prescription:write',
      ],
      securityEvents: [
        {
          type: 'account_created',
          timestamp: now,
          details: 'Account created by seed script',
        },
      ],
    };

    // Insert users into database
    await usersCollection.insertOne(admin);
    console.log('Admin user created successfully');

    await usersCollection.insertOne(pharmacist);
    console.log('Pharmacist user created successfully');

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seed function
connectDB().then(() => {
  seedUsers();
});
