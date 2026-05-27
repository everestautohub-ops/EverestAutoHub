const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// POST /api/payment/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'No items provided' });

    let totalCents = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ message: `Product "${item.name}" is no longer available` });

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      totalCents += Math.round(product.price * 100) * qty;
      validatedItems.push({
        product: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        size: item.size || '',
        color: item.color || '',
        quantity: qty,
      });
    }

    if (totalCents < 50) return res.status(400).json({ message: 'Order total is too low' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user.id.toString(), itemCount: validatedItems.length.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret, amount: totalCents, validatedItems });
  } catch (err) {
    console.error('[PAYMENT] create-intent error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/confirm-order
router.post('/confirm-order', protect, async (req, res) => {
  try {
    const { paymentIntentId, items, shippingAddress } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ message: 'Payment not completed' });

    const existing = await Order.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
    if (existing) return res.status(400).json({ message: 'Order already created for this payment' });

    let totalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product) continue;
      totalPrice += product.price * item.quantity;
      validatedItems.push({
        product: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: 'Stripe',
      totalPrice,
      isPaid: true,
      stripePaymentIntentId: paymentIntentId,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('[PAYMENT] confirm-order error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payment/transactions (admin)
router.get('/transactions', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const paymentIntents = await stripe.paymentIntents.list({ limit: 50 });
    const transactions = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      created: new Date(pi.created * 1000),
      description: pi.description || '',
    }));

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
