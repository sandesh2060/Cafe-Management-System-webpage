// File: backend/scripts/fix-table-indexes.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixTableIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-management');
    
    console.log('✅ Connected to database');
    
    const db = mongoose.connection.db;
    const collection = db.collection('tables');
    
    // Get existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    // Drop the compound index if it exists
    try {
      console.log('\n🗑️  Attempting to drop compound index...');
      await collection.dropIndex('number_1_restaurant_1');
      console.log('✅ Compound index dropped successfully');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Compound index does not exist (already removed)');
      } else {
        throw err;
      }
    }
    
    // Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    console.log('\n✅ Index migration completed successfully!');
    console.log('🔄 Please restart your backend server.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

fixTableIndexes();