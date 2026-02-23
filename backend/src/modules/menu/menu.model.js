const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Quick Bites', 'Hot Drinks', 'Cold Drinks', 'Sandwiches', 'Desserts', 'Smokes'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
  },
  available: {
    type: Boolean,
    default: true,
    index: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 5, // in minutes
    min: 0
  },
  calories: {
    type: Number,
    min: 0
  },
  allergens: [{
    type: String,
    enum: ['Dairy', 'Nuts', 'Gluten', 'Soy', 'Eggs', 'Fish', 'Shellfish']
  }],
  dietary: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb']
  }],
  customizations: [{
    name: String,
    options: [String],
    priceModifier: {
      type: Number,
      default: 0
    }
  }],
  orderCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, available: 1 });
menuItemSchema.index({ popular: 1, orderCount: -1 });

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
  return `Rs. ${this.price.toFixed(2)}`;
});

// Methods
menuItemSchema.methods.incrementOrderCount = function() {
  this.orderCount += 1;
  return this.save();
};

menuItemSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (totalRating + newRating) / this.rating.count;
  return this.save();
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;