const express = require('express');
const router  = express.Router();
const { Op } = require('sequelize');
const Notice  = require('../models/Notice');
const { protect, adminOnly } = require('../middleware/auth');

// GET active notices (public)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }],
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all notices (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const notices = await Notice.findAll({ order: [['createdAt', 'DESC']] });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create notice (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update notice (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    await notice.update(req.body);
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE notice (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Notice.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
