// Import all the tools we need
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import our route handlers
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Create our app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (helper functions that run before our main code)
app.use(cors()); // Allows our frontend to talk to backend
app.use(express.json()); // Helps us understand JSON data
app.use(express.static('public')); // Serves our HTML/CSS/JS files

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => console.log('Connected to MongoDB! 🎉'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up our routes (URL handlers)
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve our main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});