import mongoose from 'mongoose';
import User from '../models/user.model';
import { UserRole } from '../interfaces/user.interface';
import { hashPassword } from '../config/auth.config';
import env from '../config/env.config';

async function createPharmacistUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/pharmasync');
    console.log('Connected to MongoDB');

    // Check if pharmacist user already exists
    const existingPharmacist = await User.findOne({
      email: 'pharmacist@example.com',
    });
    if (existingPharmacist) {
      console.log('Pharmacist user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create a strong password that meets all requirements
    const password = 'Pharmacist@123';
    const hashedPassword = await hashPassword(password);

    // Create pharmacist user
    const pharmacistUser = new User({
      email: 'pharmacist@example.com',
      password: hashedPassword, // Already hashed
      firstName: 'Pharmacist',
      lastName: 'User',
      role: 'pharmacist', // Use lowercase role value
      isActive: true,
      isEmailVerified: true,
      phoneNumber: '+1234567890',
      licenseNumber: '123456',
    });

    // Save pharmacist user
    await pharmacistUser.save();
    console.log('Pharmacist user created successfully');
    console.log('Email: pharmacist@example.com');
    console.log('Password: Pharmacist@123');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating pharmacist user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
createPharmacistUser();
