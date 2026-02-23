/**
 * CREATE WAITER USER SCRIPT
 * 
 * This script creates a waiter user with predefined credentials
 * Run this file to automatically create the waiter in your database
 * 
 * Usage:
 * node createWaiter.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import User model (adjust path as needed)
const User = require('./src/modules/user/user.model');

// Waiter details
const waiterData = {
  name: 'Sandesh Sharma',
  email: 'sharmasandesh66@gmail.com',
  password: 'Sandesh11@',
  phoneNumber: '9876543210', // Update with actual phone if needed
  role: 'waiter', // Set role to 'manager' for admin access
  employeeId: 'WAI001',
  department: 'Service',
  salary: 3000,
  shiftTiming: '9:00 AM - 5:00 PM',
  status: 'active',
  assignedTables: [] // Will be assigned later through admin panel
};

// Connect to MongoDB and create waiter
const createWaiter = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    console.log('\n🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ 
      $or: [
        { email: waiterData.email },
        { employeeId: waiterData.employeeId }
      ]
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 Employee ID:', existingUser.employeeId);
      console.log('👤 Role:', existingUser.role);
      console.log('\n💡 If you want to update this user, please delete them first or use the update API.');
      process.exit(0);
    }

    // Create new waiter
    console.log('\n👤 Creating new waiter...');
    const waiter = await User.create(waiterData);

    console.log('\n✅ SUCCESS! Waiter created successfully!');
    console.log('\n📋 WAITER DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🆔 ID:', waiter._id);
    console.log('👤 Name:', waiter.name);
    console.log('📧 Email:', waiter.email);
    console.log('🔑 Password: Sandesh11@ (Keep this secure!)');
    console.log('📱 Phone:', waiter.phoneNumber);
    console.log('🎭 Role:', waiter.role);
    console.log('🏷️  Employee ID:', waiter.employeeId);
    console.log('🏢 Department:', waiter.department);
    console.log('💰 Salary: $' + waiter.salary);
    console.log('⏰ Shift:', waiter.shiftTiming);
    console.log('✅ Status:', waiter.status);
    console.log('📅 Created:', waiter.createdAt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎉 You can now login with these credentials:');
    console.log('   Email: sharmasandesh66@gmail.com');
    console.log('   Password: Sandesh11@');

    console.log('\n📝 NEXT STEPS:');
    console.log('1. Login to the system using the credentials above');
    console.log('2. Assign tables to this waiter through the admin panel');
    console.log('3. Start managing orders and customers!');

  } catch (error) {
    console.error('\n❌ ERROR creating waiter:');
    console.error(error.message);
    
    if (error.code === 11000) {
      console.log('\n💡 TIP: This error usually means the email or employee ID already exists.');
      console.log('   Try using a different email or employee ID.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createWaiter();