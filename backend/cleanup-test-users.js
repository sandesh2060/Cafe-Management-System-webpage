// ================================================================
// DATABASE CLEANUP SCRIPT - Find and Remove Test Users
// Run this in your backend directory: node cleanup-test-users.js
// ================================================================

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define Customer schema (minimal version for cleanup)
const customerSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  email: String,
  biometric: Object,
  totalOrders: Number,
  totalSpent: Number,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

// ==================== CLEANUP FUNCTIONS ====================

/**
 * Find all users that match test patterns
 */
async function findTestUsers() {
  console.log('\n🔍 Searching for test users...\n');
  
  const testPatterns = [
    /^test/i,
    /^san$/i,
    /^sudan$/i,
    /^sandesh/i,
    /^demo/i,
    /^user\d+$/i,
    /^customer\d+$/i,
    /^guest$/i
  ];
  
  const testUsers = await Customer.find({
    $or: [
      { username: { $in: testPatterns.map(p => ({ $regex: p })) } },
      { totalOrders: 0, totalSpent: 0 }, // Users with no orders
      { username: /^[a-z]{3,6}$/i } // Short random usernames like "san", "sudan"
    ]
  }).sort({ createdAt: -1 });
  
  return testUsers;
}

/**
 * Display users in a table
 */
function displayUsers(users) {
  console.log('┌─────────────────────────┬──────────────────────┬────────┬───────────┬─────────────────────┐');
  console.log('│ Username                │ Display Name         │ Orders │ Spent     │ Created At          │');
  console.log('├─────────────────────────┼──────────────────────┼────────┼───────────┼─────────────────────┤');
  
  users.forEach(user => {
    const username = (user.username || 'N/A').padEnd(23);
    const displayName = (user.displayName || 'N/A').substring(0, 20).padEnd(20);
    const orders = String(user.totalOrders || 0).padStart(6);
    const spent = `$${(user.totalSpent || 0).toFixed(2)}`.padStart(9);
    const created = user.createdAt ? user.createdAt.toISOString().substring(0, 19) : 'N/A';
    
    console.log(`│ ${username} │ ${displayName} │ ${orders} │ ${spent} │ ${created} │`);
  });
  
  console.log('└─────────────────────────┴──────────────────────┴────────┴───────────┴─────────────────────┘');
}

/**
 * Find specific usernames
 */
async function findSpecificUsers(usernames) {
  console.log('\n🔍 Searching for specific usernames...\n');
  
  const users = await Customer.find({
    username: { $in: usernames.map(u => u.toLowerCase()) }
  });
  
  return users;
}

/**
 * Delete users by IDs
 */
async function deleteUsers(userIds) {
  const result = await Customer.deleteMany({
    _id: { $in: userIds }
  });
  
  return result;
}

// ==================== MAIN SCRIPT ====================

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   🧹 DATABASE CLEANUP - Test User Manager        ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    
    // Option 1: Find users with 0 orders and 0 spent
    console.log('\n📊 Finding users with no activity (0 orders, $0 spent)...\n');
    const inactiveUsers = await Customer.find({
      totalOrders: 0,
      totalSpent: 0
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${inactiveUsers.length} inactive users:\n`);
    if (inactiveUsers.length > 0) {
      displayUsers(inactiveUsers);
    }
    
    // Option 2: Find specific problematic usernames
    console.log('\n📊 Checking for specific test usernames...\n');
    const testUsernames = ['san', 'sudan', 'test', 'demo', 'guest'];
    const specificUsers = await findSpecificUsers(testUsernames);
    
    if (specificUsers.length > 0) {
      console.log(`Found ${specificUsers.length} test users:\n`);
      displayUsers(specificUsers);
      
      // Uncomment the following lines to actually delete these users
      // WARNING: This will permanently delete data!
      
      console.log('\n⚠️  DELETING USERS...');
      const deleteResult = await deleteUsers(specificUsers.map(u => u._id));
      console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
      
    } else {
      console.log('✅ No test users found with these usernames');
    }
    
    // Option 3: Find ALL users (for review)
    console.log('\n📊 All users in database:\n');
    const allUsers = await Customer.find({}).sort({ createdAt: -1 });
    console.log(`Total users: ${allUsers.length}\n`);
    displayUsers(allUsers);
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('To delete specific users, uncomment the delete section');
    console.log('and run this script again.');
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();