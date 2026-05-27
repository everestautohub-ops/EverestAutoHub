const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const sequelize = require('../config/db');

const updateProductRating = async (productId) => {
  if (!productId) return;
  const reviews = await Review.findAll({ where: { productId, isApproved: true } });
  if (reviews.length === 0) {
    await Product.update({ rating: 0, numReviews: 0 }, { where: { id: productId } });
    return;
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.update({ rating: Math.round(avg * 10) / 10, numReviews: reviews.length }, { where: { id: productId } });
};

// GET approved reviews
router.get('/', async (req, res) => {
  try {
    const { productId, sort = 'newest' } = req.query;
    const where = { isApproved: true };
    if (productId) where.productId = productId;

    const orderMap = { newest: [['createdAt', 'DESC']], highest: [['rating', 'DESC']], lowest: [['rating', 'ASC']], helpful: [['helpful', 'DESC']] };
    const reviews = await Review.findAll({ where, order: orderMap[sort] || orderMap.newest });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST submit review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment, title } = req.body;

    if (productId) {
      const existing = await Review.findOne({ where: { productId, userId: req.user.id } });
      if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    let verified = false;
    if (productId) {
      // Check if user has a delivered order containing this product
      const orders = await Order.findAll({ where: { userId: req.user.id, status: 'delivered' } });
      verified = orders.some(o => o.items?.some(i => String(i.product) === String(productId)));
    }

    const review = await Review.create({
      userId: req.user.id,
      productId: productId || null,
      name: req.user.name,
      rating,
      comment,
      title: title || '',
      type: productId ? 'product' : 'general',
      verified,
      isApproved: false,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST mark helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.update({ helpful: review.helpful + 1 });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reviews (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: Product, as: 'product', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve/reject (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.update({ isApproved: req.body.isApproved });
    if (review.productId) await updateProductRating(review.productId);
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE review (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const productId = review.productId;
    await review.destroy();
    if (productId) await updateProductRating(productId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
