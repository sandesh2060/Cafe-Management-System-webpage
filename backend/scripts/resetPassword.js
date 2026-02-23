// File: backend/scripts/resetPassword.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/user/user.model');

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name');
    console.log('✅ Connected to MongoDB');

    const email = 'sharmasandesh66@gmail.com';
    const newPassword = 'Sandesh11@Sandesh11@';

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('📋 Current role:', user.role);
    console.log('📋 Current status:', user.status);

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPassword();