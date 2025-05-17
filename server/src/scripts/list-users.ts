import mongoose from 'mongoose';
import User from '../models/user.model';

async function listUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/pharmasync');
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}, 'email firstName lastName role isActive');
    
    console.log('Users in the database:');
    console.log('---------------------');
    
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Role: ${user.role}`);
        console.log(`Active: ${user.isActive}`);
        console.log('---------------------');
      });
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error listing users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
listUsers();
