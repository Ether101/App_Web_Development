const mongoose = require('mongoose');

// Define what an order looks like in our database
const orderSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
