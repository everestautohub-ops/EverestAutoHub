const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { protect, adminOnly } = require('../middleware/auth');

// GET (public)
router.get('/', async (req, res) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) content = await SiteContent.create({});
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (admin)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...fields } = req.body;
    let content = await SiteContent.findOne();
    if (content) {
      await content.update(fields);
    } else {
      content = await SiteContent.create(fields);
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
