const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active services (public)
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({ where: { isActive: true } });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all services (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create service (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update service (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.update(req.body);
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete service (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Service.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
