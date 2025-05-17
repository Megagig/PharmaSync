/**
 * Script to seed admin users into MongoDB Atlas
 * Run with: node scripts/seedAdminUsersAtlas.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Use local MongoDB instance
const uri = 'mongodb://localhost:27017/pharmasync-dev';

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

async function seedUsers() {
  console.log('Starting user seeding process...');
  console.log('MongoDB URI:', uri ? 'URI is set' : 'URI is not set');

  // Create MongoDB client with appropriate options
  const client = new MongoClient(uri, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,
    ssl: true,
    tls: true,
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully');

    const database = client.db();
    const usersCollection = database.collection('users');

    // Check if users already exist
    console.log('Checking for existing users...');
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
    console.log('Hashing passwords...');
    const adminPassword = await hashPassword('Anthony@247');
    const pharmacistPassword = await hashPassword('Pharmacist@247');

    // Current timestamp
    const now = new Date();

    // Create admin user
    console.log('Creating admin user...');
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
    console.log('Creating pharmacist user...');
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
    const adminResult = await usersCollection.insertOne(admin);
    console.log(
      'Admin user created successfully with ID:',
      adminResult.insertedId
    );

    const pharmacistResult = await usersCollection.insertOne(pharmacist);
    console.log(
      'Pharmacist user created successfully with ID:',
      pharmacistResult.insertedId
    );

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedUsers().catch(console.error);
