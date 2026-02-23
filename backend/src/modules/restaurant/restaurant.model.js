const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  // Add other fields as needed
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);