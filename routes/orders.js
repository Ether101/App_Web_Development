const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const paypal = require('paypal-rest-sdk');
const router = express.Router();

// Configure PayPal
paypal.configure({
  'mode': 'sandbox', // sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create payment (start the payment process)
router.post('/create-payment', async (req, res) => {
  try {
    const { items, totalAmount, customerEmail } = req.body;
    
    // Create PayPal payment object
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": `http://localhost:3000/api/orders/success`,
        "cancel_url": `http://localhost:3000/api/orders/cancel`
      },
      "transactions": [{
        "item_list": {
          "items": items.map(item => ({
            "name": item.productName,
            "sku": item.productId,
            "price": item.price.toString(),
            "currency": "USD",
            "quantity": item.quantity
          }))
        },
        "amount": {
          "currency": "USD",
          "total": totalAmount.toString()
        },
        "description": "Purchase from My E-commerce Store"
      }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment creation failed' });
      } else {
        // Store order temporarily (you might want to use a session or cache)
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.json({ approvalUrl, paymentId: payment.id });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET payment success handler
router.get('/success', async (req, res) => {
  try {
    const { PayerID, paymentId } = req.query;
    
    const execute_payment_json = {
      "payer_id": PayerID
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error(error);
        res.redirect('/orders.html?status=error');
      } else {
        // Create order in database
        const newOrder = new Order({
          customerEmail: payment.payer.payer_info.email,
          items: payment.transactions[0].item_list.items.map(item => ({
            productId: item.sku,
            productName: item.name,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          })),
          totalAmount: parseFloat(payment.transactions[0].amount.total),
          paymentId: paymentId,
          paymentStatus: 'completed'
        });
        
        await newOrder.save();
        res.redirect('/orders.html?status=success');
      }
    });
  } catch (error) {
    res.redirect('/orders.html?status=error');
  }
});

// GET payment cancel handler
router.get('/cancel', (req, res) => {
  res.redirect('/orders.html?status=cancelled');
});

module.exports = router;