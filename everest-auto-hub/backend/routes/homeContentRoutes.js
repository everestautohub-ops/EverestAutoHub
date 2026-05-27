const express = require('express');
const router = express.Router();
const HomeContent = require('../models/HomeContent');
const { protect, adminOnly } = require('../middleware/auth');

// GET (public)
router.get('/', async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) content = await HomeContent.create({});
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (admin)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...fields } = req.body;
    let content = await HomeContent.findOne();
    if (content) {
      await content.update(fields);
    } else {
      content = await HomeContent.create(fields);
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
