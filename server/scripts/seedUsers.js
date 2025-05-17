/**
 * Script to seed initial users into MongoDB
 * Run with: node scripts/seedUsers.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define User Schema (simplified version of your actual schema)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
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
    enum: ['admin', 'pharmacist', 'manager', 'cashier'],
    default: 'pharmacist',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  phoneNumber: String,
  licenseNumber: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Seed users
const seedUsers = async () => {
  try {
    // Check if users already exist
    const adminExists = await User.findOne({ email: 'Megagigdev@gmail.com' });
    const pharmacistExists = await User.findOne({ email: 'turningpointcodes@gmail.com' });
    
    // Delete existing users if they exist
    if (adminExists) {
      console.log('Deleting existing admin user...');
      await User.deleteOne({ email: 'Megagigdev@gmail.com' });
    }
    
    if (pharmacistExists) {
      console.log('Deleting existing pharmacist user...');
      await User.deleteOne({ email: 'turningpointcodes@gmail.com' });
    }
    
    // Create admin user
    const admin = new User({
      email: 'Megagigdev@gmail.com',
      password: 'Anthony@247',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      approvalStatus: 'approved',
      phoneNumber: '+1234567890',
    });
    
    // Create pharmacist user
    const pharmacist = new User({
      email: 'turningpointcodes@gmail.com',
      password: 'Pharmacist@247',
      firstName: 'Pharmacist',
      lastName: 'User',
      role: 'pharmacist',
      isActive: true,
      isEmailVerified: true,
      approvalStatus: 'approved',
      phoneNumber: '+0987654321',
      licenseNumber: 'PHARM-12345',
    });
    
    // Save users to database
    await admin.save();
    console.log('Admin user created successfully');
    
    await pharmacist.save();
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
