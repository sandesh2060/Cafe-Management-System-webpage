/**
 * CREATE MANAGER USER SCRIPT
 * 
 * This script creates a manager user with predefined credentials
 * Run this file to automatically create the manager in your database
 * 
 * Usage:
 * node createManager.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import User model (adjust path as needed)
const User = require('./src/modules/user/user.model');

// Manager details
const managerData = {
  name: 'Sandesh Sharma',
  email: 'sharmasandesh66@gmail.com',
  password: 'Sandesh11@',
  phoneNumber: '9876543210',
  role: 'manager', // Now using the dedicated 'manager' role
  employeeId: 'MGR001',
  department: 'Management',
  salary: 5000,
  shiftTiming: '9:00 AM - 6:00 PM',
  status: 'active'
};

// Connect to MongoDB and create manager
const createManager = async () => {
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
      email: managerData.email
    });

    if (existingUser) {
      console.log('⚠️  User with this email already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 Employee ID:', existingUser.employeeId);
      console.log('👤 Current Role:', existingUser.role);
      
      // Ask if they want to update to manager
      console.log('\n🔄 Updating existing user to MANAGER role...');
      
      existingUser.role = 'manager';
      existingUser.employeeId = 'MGR001';
      existingUser.department = 'Management';
      existingUser.salary = 5000;
      existingUser.shiftTiming = '9:00 AM - 6:00 PM';
      existingUser.status = 'active';
      // Clear waiter-specific fields
      existingUser.assignedTables = [];
      
      await existingUser.save();
      
      console.log('\n✅ SUCCESS! User updated to MANAGER!');
      console.log('\n📋 UPDATED MANAGER DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🆔 ID:', existingUser._id);
      console.log('👤 Name:', existingUser.name);
      console.log('📧 Email:', existingUser.email);
      console.log('🔑 Password: Sandesh11@ (Keep this secure!)');
      console.log('📱 Phone:', existingUser.phoneNumber);
      console.log('🎭 Role:', existingUser.role);
      console.log('🏷️  Employee ID:', existingUser.employeeId);
      console.log('🏢 Department:', existingUser.department);
      console.log('💰 Salary: $' + existingUser.salary);
      console.log('⏰ Shift:', existingUser.shiftTiming);
      console.log('✅ Status:', existingUser.status);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } else {
      // Create new manager
      console.log('\n👤 Creating new manager...');
      const manager = await User.create(managerData);

      console.log('\n✅ SUCCESS! Manager created successfully!');
      console.log('\n📋 MANAGER DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🆔 ID:', manager._id);
      console.log('👤 Name:', manager.name);
      console.log('📧 Email:', manager.email);
      console.log('🔑 Password: Sandesh11@ (Keep this secure!)');
      console.log('📱 Phone:', manager.phoneNumber);
      console.log('🎭 Role:', manager.role);
      console.log('🏷️  Employee ID:', manager.employeeId);
      console.log('🏢 Department:', manager.department);
      console.log('💰 Salary: $' + manager.salary);
      console.log('⏰ Shift:', manager.shiftTiming);
      console.log('✅ Status:', manager.status);
      console.log('📅 Created:', manager.createdAt);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('\n🎉 You can now login with these credentials:');
    console.log('   Email: sharmasandesh66@gmail.com');
    console.log('   Password: Sandesh11@');

    console.log('\n📝 MANAGER PERMISSIONS:');
    console.log('✅ Manage users (view, create, update)');
    console.log('✅ Manage waiters and assign tables');
    console.log('✅ View and manage orders');
    console.log('✅ Access inventory and menu management');
    console.log('✅ View statistics and reports');
    console.log('✅ Update user status');
    console.log('❌ Cannot create/delete admin or other manager accounts (Admin only)');
    console.log('❌ Cannot delete manager accounts (Admin only)');

    console.log('\n📝 NEXT STEPS:');
    console.log('1. Login to the system using the credentials above');
    console.log('2. Access the manager dashboard');
    console.log('3. Start managing the cafe operations!');

  } catch (error) {
    console.error('\n❌ ERROR creating manager:');
    console.error(error.message);
    
    if (error.code === 11000) {
      console.log('\n💡 TIP: This error usually means the employee ID already exists.');
      console.log('   The email check should have caught this, but if you see this,');
      console.log('   try using a different employee ID.');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createManager();