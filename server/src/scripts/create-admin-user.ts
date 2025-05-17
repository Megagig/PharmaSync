import mongoose from 'mongoose';
import User from '../models/user.model';
import { UserRole } from '../interfaces/user.interface';
import { hashPassword } from '../config/auth.config';
import env from '../config/env.config';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/pharmasync');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create a strong password that meets all requirements
    const password = 'Admin@123';
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = new User({
      email: 'admin@example.com',
      password: hashedPassword, // Already hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin', // Use lowercase role value
      isActive: true,
      isEmailVerified: true,
      phoneNumber: '+1234567890',
    });

    // Save admin user
    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
createAdminUser();
