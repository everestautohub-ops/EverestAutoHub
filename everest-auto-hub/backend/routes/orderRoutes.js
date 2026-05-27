const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../utils/sendEmail');

// Place order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: 'No items in order' });
    if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address)
      return res.status(400).json({ message: 'Shipping address is required' });

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ message: `Product "${item.name}" is no longer available` });
      if (item.quantity < 1)
        return res.status(400).json({ message: 'Invalid quantity' });

      validatedItems.push({
        product: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
      });
      calculatedTotal += product.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user.id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalPrice: calculatedTotal,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status: req.body.status });

    const email = order.user?.email || order.shippingAddress?.email;
    const name  = order.user?.name  || order.shippingAddress?.name;
    if (email) {
      sendOrderStatusEmail(email, name, order).catch(e =>
        console.error('[EMAIL] Order status email failed:', e.message)
      );
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
