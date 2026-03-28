const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  stockAlert: {
    type: Number,
    default: 10
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  images: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);