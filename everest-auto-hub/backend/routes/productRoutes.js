const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    if (search) where.name = { [Op.like]: `%${search}%` };
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { isActive: true, isFeatured: true }, limit: 8 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.findAll({
      where: { id: { [Op.ne]: product.id }, category: product.category, isActive: true },
      limit: 4,
    });
    res.json(related);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
