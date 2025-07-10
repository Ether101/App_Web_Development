// Shared utility functions for the e-commerce application

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Show loading spinner
function showLoading(elementId, show = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

// Show error message
function showMessage(elementId, message, type = 'error') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = type;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

// Validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate form data
function validateProductForm(formData) {
  const errors = [];
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long');
  }
  
  if (!formData.description || formData.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!formData.price || formData.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  
  if (!formData.category) {
    errors.push('Please select a category');
  }
  
  if (!formData.stock || formData.stock < 0) {
    errors.push('Stock quantity must be 0 or greater');
  }
  
  return errors;
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Handle API errors
function handleAPIError(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

// Shopping cart functionality (in-memory storage)
let cart = [];

function addToCart(product, quantity = 1) {
  const existingItem = cart.find(item => item.id === product._id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    });
  }
  
  updateCartDisplay();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Update cart badge if it exists
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = cartCount;
  }
  
  // Update cart total if it exists
  const cartTotalElement = document.getElementById('cartTotal');
  if (cartTotalElement) {
    cartTotalElement.textContent = formatCurrency(cartTotal);
  }
}

// Initialize cart display when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateCartDisplay();
});